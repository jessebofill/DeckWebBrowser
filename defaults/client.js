((wsPort, tabId, apiKey) => {
    if (window.scriptLoaded) {
        console.debug('Web Browser script already loaded');
        return;
    }
    window.scriptLoaded = true;
    console.debug('Web Browser tab frontend id', tabId);

    const MessageType = {
        SERVER: 'server',
        REQUEST_MIC: 'requestMic',
        DENY_MIC: 'denyMic',
        OFFER: 'offer',
        ANSWER: 'answer',
        CANDIDATE: 'candidate',
    };

    class WSManager {
        constructor(port, tabId, key) {
            this.port = port;
            this.id = tabId;
            this.key = key;
            this.responsePromises = new Map();
            this.msgId = 0;
            this.readyToSend = false;
            this.handleOffer = async () => { };
            this.handleCandidate = async () => { };
        }
        connect() {
            this.ws = new WebSocket(`ws://127.0.0.1:${this.port}/ws?api_key=${this.key}`);
            this.ws.onerror = e => console.error('WebSocket error', e);
            this.ws.onclose = e => console.error('WebSocket closed', e);
            this.ws.onopen = e => console.debug('WebSocket opened', e);
            this.ws.onmessage = async (message) => {
                const data = JSON.parse(message.data);
                this.handlerServerResponse(data);

                switch (data.messageType) {
                    case MessageType.OFFER:
                        await this.handleOffer(data.data);
                        break;
                    case MessageType.CANDIDATE:
                        await this.handleCandidate(data.data);
                        break;
                }
            };
            return new Promise((resolve, reject) => {
                this.ws.onopen = () => {
                    console.debug('WebSocket connected. Sending registration')
                    this.sendBare({ type: 'register', targetType: 'client', targetId: this.id }, true)
                        .then(() => {
                            console.debug('WebSocket server registration successful');
                            resolve(this.readyToSend = true);
                        })
                        .catch(e => reject(`WebSocket server registration failed: ${e}`));
                };
            });
        }
        sendBare(msg, getServerResponse) {
            if (!this.ws) throw new Error('Tried to send before socket created');
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
        msgHost(msgType, data) {
            if (!this.readyToSend) throw new Error('Tried to send before connection esatablished');
            const msg = {
                type: 'sendToMain',
                message: {
                    messageType: msgType,
                    data: data
                },
                fromTargetId: this.id,
            };
            return this.sendBare(msg, false);
        }
        handlerServerResponse(data) {
            if (data.msgId && data.response && this.responsePromises.has(data.msgId)) {
                const { resolve, reject } = this.responsePromises.get(data.msgId);
                const response = data.response
                if (response.result === 'success') resolve(response.message);
                if (response.result === 'error') reject(response.message)
                this.responsePromises.delete(data.msgId);
            }
        }
        setHandlers(handleOffer, handleCandidate) {
            this.handleOffer = handleOffer;
            this.handleCandidate = handleCandidate;
        }
    }


    class RTCHandler {
        constructor(wsManager) {
            this.wsManager = wsManager;
            this.wsManager.setHandlers(this.handleOffer.bind(this), this.handleCandidate.bind(this));

        }
        async handleOffer(data) {
            console.debug('Recieved RTC offer from host. Setting up connection');
            this.peerConnection = new RTCPeerConnection();
            this.peerConnection.onaddstream = this.onAddStream;

            this.peerConnection.onconnectionstatechange = (e) => {
                if (this.peerConnection.connectionState === 'closed') console.debug(`RTC connection with host closed`);
                if (this.peerConnection.connectionState === 'failed') console.debug(`RTC connection with host failed`);
                if (this.peerConnection.connectionState === 'disconnected') console.debug(`RTC connection with host disconnected`);
                if (this.peerConnection.connectionState === 'connected') console.debug(`RTC connection established with host`);
            }
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    console.debug(`Sending RTC candidate to host`);
                    this.wsManager.msgHost(MessageType.CANDIDATE, event.candidate);
                }
            };
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            console.debug('Set RTC remote description for host');
            console.debug('Creating RTC answer for host');
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            console.debug('Sending RTC answer to host');
            this.wsManager.msgHost(MessageType.ANSWER, answer);
        }
        async handleCandidate(candidate) {
            console.debug('Recieved RTC candidate from host');
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.debug('Added RTC candidate from host');
        }

        resolveOnAddStream(resolve) {
            this.onAddStream = event => resolve(event.stream);
        }
    }

    function showPermissionModal(onAccept, onResult) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.zIndex = '9999';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#242529';
        modalContent.style.color = '#fff';
        modalContent.style.margin = 'auto';
        modalContent.style.padding = '20px';
        modalContent.style.width = '35%';
        modalContent.style.textAlign = 'center';
        modalContent.style.borderRadius = '8px';

        const closeButton = document.createElement('span');
        closeButton.innerHTML = trustedTypes && trustedTypes.createPolicy ? trustedTypes.createPolicy('default', { createHTML: s => s }).createHTML('&times;') : '&times;';
        closeButton.style.color = '#ccc';
        closeButton.style.float = 'right';
        closeButton.style.fontSize = '24px';
        closeButton.style.fontWeight = '500';
        closeButton.style.cursor = 'pointer';
        closeButton.onmouseover = () => closeButton.style.color = '#fff';
        closeButton.onmouseleave = () => closeButton.style.color = '#ccc';

        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Allow';
        acceptButton.style.margin = '10px';
        acceptButton.style.padding = '10px 20px';
        acceptButton.style.fontSize = '16px';
        acceptButton.style.backgroundColor = '#003b75';
        acceptButton.style.color = '#fff';
        acceptButton.style.border = 'none';
        acceptButton.style.borderRadius = '5px';
        acceptButton.style.transition = 'background-color 0.2s';
        acceptButton.style.cursor = 'pointer';
        acceptButton.onmouseover = () => acceptButton.style.backgroundColor = '#00527a';
        acceptButton.onmouseleave = () => acceptButton.style.backgroundColor = '#003b75';

        const denyButton = document.createElement('button');
        denyButton.textContent = 'Deny';
        denyButton.style.margin = '10px';
        denyButton.style.padding = '10px 20px';
        denyButton.style.fontSize = '16px';
        denyButton.style.backgroundColor = '#003b75';
        denyButton.style.color = '#fff';
        denyButton.style.border = 'none';
        denyButton.style.borderRadius = '5px';
        denyButton.style.transition = 'background-color 0.2s';
        denyButton.style.cursor = 'pointer';
        denyButton.onmouseover = () => denyButton.style.backgroundColor = '#00527a';
        denyButton.onmouseleave = () => denyButton.style.backgroundColor = '#003b75';

        const spinner = document.createElement('div');
        spinner.style.border = '5px solid #555';
        spinner.style.borderTop = '5px solid #aaa';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '16px';
        spinner.style.height = '16px';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.margin = '16px auto';
        spinner.style.display = 'none';

        const keyframes = `@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }`;
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = keyframes;

        const message = document.createElement('p');
        message.style.margin = '14px 30px';
        message.textContent = "This site wants to access your microphone.";

        closeButton.onclick = () => closeWithResult(false);
        denyButton.onclick = () => closeWithResult(false);
        acceptButton.onclick = event => {
            if (!event.isTrusted) return;
            spinner.style.display = 'block';
            message.textContent = "Getting mic stream...";
            acceptButton.style.display = 'none';
            denyButton.style.display = 'none';
            onAccept(stream => closeWithResult(stream), () => {
                message.textContent = "Failed to get mic stream. Please refresh the page to try again.";
                spinner.style.display = 'none';
            });
        };

        modalContent.appendChild(closeButton);
        modalContent.appendChild(message);
        modalContent.appendChild(spinner);
        modalContent.appendChild(acceptButton);
        modalContent.appendChild(denyButton);
        modal.appendChild(modalContent);
        modal.appendChild(styleSheet);
        document.body.appendChild(modal);

        const closeWithResult = (stream) => {
            modal.style.display = 'none';
            modal.remove();
            onResult(stream);
        };
    }

    function getStreamPromise() {
        let resolver;
        return ({ stream: new Promise((res) => resolver = res), resolver });
    }
    async function getUserMedia(constraints) {
        console.debug('getUserMedia called with constraints', constraints);
        if (constraints?.video) throw new DOMException('Requested device not found', 'NotFoundError');
        if (!constraints?.audio) throw new TypeError(`Failed to execute 'getUserMedia' on 'MediaDevices': At least one of audio and video must be requested`);
        if (!remoteStream) remoteStream = await getUserPermission();
        window.stream = remoteStream
        const stream = remoteStream.clone();
        try {
            await stream.getTracks()[0].applyConstraints(constraints.audio);
        } catch { }
        return stream;
    };

    async function getStream() {
        const { stream, resolver } = getStreamPromise();
        rtcHandler.resolveOnAddStream(resolver);

        await wsManager.connect();
        console.debug('Requesting mic access from host');
        wsManager.msgHost(MessageType.REQUEST_MIC, {});

        const _stream = await stream;
        const audioElement = document.createElement('audio');
        audioElement.srcObject = _stream;
        return _stream;
    }
    async function denyAccess() {
        await wsManager.connect();
        console.debug('Denying mic access');
        wsManager.msgHost(MessageType.DENY_MIC, {});
    }
    function getUserPermission() {
        return new Promise((resolve, reject) => {
            const onAccept = (onSuccess, onError) => getStream().then(onSuccess).catch(onError);
            const onResult = stream => {
                if (stream) resolve(stream);
                else {
                    denyAccess();
                    reject(new DOMException('Permission denied', 'NotAllowedError'));
                }
            };
            showPermissionModal(onAccept, onResult);
        });
    }

    let remoteStream;
    const wsManager = new WSManager(wsPort, tabId, apiKey);
    const rtcHandler = new RTCHandler(wsManager);

    // window.wsm = wsManager
    // window.rtc = rtcHandler

    // navigator.getUserMedia = (constraints, res, rej) => {
    //     getUserMedia(constraints).then(stream => res(stream)).catch(e => rej(e));
    // }
    navigator.mediaDevices.getUserMedia = async constraints => await getUserMedia(constraints);
    const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
    navigator.mediaDevices.enumerateDevices = async () => (await originalEnumerateDevices.call(navigator.mediaDevices)).filter(device => device.kind !== 'audioinput' || device.deviceId === 'default');
})(port, id, key)