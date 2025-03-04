import { Logger } from '../lib/log';
import { WSManager, MessageType } from './WSManager';

const rtcLogger = new Logger('RTC');
export class RTCHandler {
    wsManager: WSManager;
    peerConnection: RTCPeerConnection;
    id: string;
    constructor(id: string, wsManager: WSManager, onClose: Function) {
        this.id = id;
        this.wsManager = wsManager;
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.onconnectionstatechange = (e) => {
            const state = this.peerConnection.connectionState;
            // rtcLogger.debug('Connection state changed', state, e);
            if (state === 'closed' || state === 'disconnected') {
                rtcLogger.debug(`Connection with client ${this.id} closed`);
                onClose();
            }
            if (state === 'connected') {
                rtcLogger.debug(`Connection established with client ${this.id}`);
            }

        };
    }
    async createOffer(from: string) {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, localStream));

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                rtcLogger.debug(`Sending candidate to client ${this.id}`);
                this.wsManager.msgClient(MessageType.CANDIDATE, event.candidate, from);
            }
        };
        rtcLogger.debug(`Creating offer for client ${this.id}`);
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        rtcLogger.debug(`Sending offer to client ${this.id}`);
        this.wsManager.msgClient(MessageType.OFFER, offer, from);
    }
    async handleAnswer(answer: RTCSessionDescriptionInit) {
        rtcLogger.debug(`Recieved answer from client ${this.id}. Setting remote description`);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        rtcLogger.debug(`Set remote description for client ${this.id}`);
    }
    async handleCandidate(candidate: RTCIceCandidate) {
        rtcLogger.debug(`Recieved candidate from client ${this.id}`);
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        rtcLogger.debug(`Added candidate for client ${this.id}`);
    }
}
