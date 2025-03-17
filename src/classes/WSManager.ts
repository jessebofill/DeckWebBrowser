import { Logger } from '../lib/log';
import { MicAccess } from './BrowserTabHandler';
import { RTCHandler } from './RTCHandler';

export enum MessageType {
    REQUEST_MIC = 'requestMic',
    DENY_MIC = 'denyMic',
    CONNECTION_CLOSED = 'connectionClosed',
    OFFER = 'offer',
    ANSWER = 'answer',
    CANDIDATE = 'candidate'
};

type MessageData<T extends MessageType> =
    T extends MessageType.REQUEST_MIC ? {} :
    T extends MessageType.DENY_MIC ? {} :
    T extends MessageType.CONNECTION_CLOSED ? { targetId: string } :
    T extends MessageType.OFFER ? RTCSessionDescriptionInit :
    T extends MessageType.ANSWER ? RTCSessionDescriptionInit :
    T extends MessageType.CANDIDATE ? RTCIceCandidate :
    never
interface MessageSend<T extends MessageType> {
    messageType: T,
    data: MessageData<T>
}

interface MessageRecieve<T extends MessageType> extends MessageSend<T> {
    fromTargetId: string;
}

interface SendToMessage {
    msgId: any;
    type: 'sendToTarget';
    message: MessageSend<MessageType>;
    fromTargetId: string;
    toTargetId: string;
}

interface RegisterMainServerMsg {
    msgId: any;
    type: 'register';
    targetType: 'main';
    targetId: string;
}

interface WatchConnectionServerMsg {
    msgId: any;
    type: 'watchConnection';
    idToWatch: string;
}

interface ServerResponse {
    msgId: any;
    response: {
        result: 'success' | 'error';
        message: string;
    };
}
const wsLogger = new Logger('WebSocket');
export class WSManager {
    id: string;
    ws: WebSocket;
    responsePromises = new Map();
    msgId = 0;
    readyToSend = false;
    clients = new Map<string, RTCHandler>();
    onMicAccessChange = (id: string, state: MicAccess) => undefined;
    constructor(port: number, mainId: string, key: string) {
        this.id = mainId;
        this.ws = new WebSocket(`ws://127.0.0.1:${port}/ws?api_key=${key}`);
        this.ws.onerror = e => wsLogger.error('Error', e);
        this.ws.onclose = e => wsLogger.error('Connection closed', e);
        this.ws.onopen = e => wsLogger.debug('Connection opened', e);
        this.ws.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            if (data.msgId && data.response && this.responsePromises.has(data.msgId)) {
                const { resolve, reject } = this.responsePromises.get(data.msgId);
                const response = data.response as ServerResponse['response'];
                if (response.result === 'success') resolve(response.message);
                if (response.result === 'error') reject(response.message)
                this.responsePromises.delete(data.msgId);
            }
            const msg = data as MessageRecieve<MessageType>;
            switch (msg.messageType) {
                case MessageType.REQUEST_MIC:
                    wsLogger.debug(`Recieved mic request from client ${this.id}`);
                    this.wtachConnection(msg.fromTargetId)
                    this.handleRequest(msg.fromTargetId).createOffer(msg.fromTargetId);
                    this.onMicAccessChange(msg.fromTargetId, MicAccess.ALLOWED);
                    break;
                case MessageType.DENY_MIC:
                    wsLogger.debug(`Mic access denied for client ${this.id}`);
                    this.wtachConnection(msg.fromTargetId)
                    this.onMicAccessChange(msg.fromTargetId, MicAccess.BLOCKED);
                    break;
                case MessageType.CONNECTION_CLOSED:
                    this.onMicAccessChange((msg as MessageRecieve<MessageType.CONNECTION_CLOSED>).data.targetId, MicAccess.NONE);
                    break;
                case MessageType.ANSWER:
                    this.getConnection(msg.fromTargetId)?.handleAnswer((msg as MessageRecieve<MessageType.ANSWER>).data);
                    break;
                case MessageType.CANDIDATE:
                    this.getConnection(msg.fromTargetId)?.handleCandidate((msg as MessageRecieve<MessageType.CANDIDATE>).data);
                    break;
            }
        };
        this.ws.onopen = () => {
            wsLogger.debug('Connected to server. Sending registration')
            this.sendBare({ type: 'register', targetType: 'main', targetId: this.id }, true)
                .then(() => {
                    wsLogger.debug('Server registration successful');
                    this.readyToSend = true;
                })
                .catch(e => wsLogger.error('Server registration failed', e));
        };
    }

    sendBare(msg: any, getServerResponse = false) {
        this.msgId += 1;
        msg.msgId = this.msgId;
        if (getServerResponse) {
            return new Promise((resolve, reject) => {
                this.responsePromises.set(this.msgId, { resolve, reject });
                this.ws.send(JSON.stringify(msg));
            });
        } else {
            this.ws.send(JSON.stringify(msg));
            return Promise.resolve();
        }
    }
    msgClient<T extends MessageType>(msgType: T, data: MessageSend<T>['data'], to: string) {
        if (!this.readyToSend) wsLogger.throw('Tried to send before connection esatablished');
        const msg = {
            type: 'sendToTarget',
            message: {
                messageType: msgType,
                data: data
            },
            fromTargetId: this.id,
            toTargetId: to
        };
        return this.sendBare(msg, false);
    }
    wtachConnection(id: string) {
        this.sendBare({ type: 'watchConnection', idToWatch: id })
    }
    handleRequest(id: string): RTCHandler {
        let rtcHandler = this.clients.get(id);
        if (!rtcHandler || rtcHandler.peerConnection.connectionState !== 'connected') {
            rtcHandler = new RTCHandler(id, this, () => this.clients.delete(id));
            this.clients.set(id, rtcHandler);
        }
        return rtcHandler;
    }
    getConnection(id: string): RTCHandler | undefined {
        return this.clients.get(id);
    }
}

