import { CEventName } from "../../data/CEventName";
import { MessageRegister } from "../../protobuf/Message";
import EventMng from "../event/EventMng";
import { ISocket, SocketState, WbSocket, WxSocket } from "./Socket";

const DATA_TOTAL_LEN = 4;	//数据总长度
const PROTOCOLTYPE_LEN = 4;	//协议号长度

export interface ISocketDelegate {
    onSocketOpen();
    onSocketMessage(data: string | ArrayBuffer);
    onSocketError(errMsg);
    onSocketClosed(msg: string);
}

/**
 * 实现socket各个回调接口
 */
export class SocketDelegate implements ISocketDelegate {
    private _socket: ISocket;

    isSocketOpened() {
        return (this._socket && this._socket.getState() == SocketState.OPEN);
    }

    isSocketClosed() {
        return this._socket == null;
    }

    connect(url: string) {
        console.log('connect socket = ' + url);
        // 根据平台创建socket
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this._socket = new WxSocket(url, this);
        } else {
            this._socket = new WbSocket(url, this);
        }
        this._socket.connect();
    }

    closeConnect() {
        if (this._socket) {
            this._socket.close();
        }
    }

    onSocketOpen() {
        console.log('socket open');
        EventMng.emit(CEventName.SOCKET_OPEN);
    }

    onSocketError(errMsg) {
        errMsg && console.error('socket error, msg = ' + errMsg);
    }

    onSocketClosed(msg: string) {
        console.log('socket close, reason = ' + msg);
        if (this._socket) {
            this._socket.close();
        }
        this._socket = null;
        EventMng.emit(CEventName.SOCKET_CLOSE);
    }

    onSocketMessage(data: string | ArrayBuffer) {
        if (this.isSocketClosed()) {
            console.error('onMessage call but socket had closed')
            return;
        }
        let msg;
        if (typeof (data) === 'string') {
            msg = data;
        } else {
            msg = this.bufferToMsg(data);
        }
        console.log('recieve msg = ', msg);
    }

    send(msg) {
        if (typeof (msg) === 'string') {
            this._socket.send(msg);
        } else {
            let sendBuf = this.msgToBuffer(msg);
            this._socket.send(sendBuf);
        }
    }

    /**
     * buffer转msg，解包用
     * 协议格式：总字节数（4个字节，总字节数=协议号字节数+数据长度） + 协议号（4个字节） + 数据长度
     * @param recvBuf 
     */
    private bufferToMsg(recvBuf: ArrayBuffer) {
        let recvView = new DataView(recvBuf);
        let protocolType = recvView.getInt32(DATA_TOTAL_LEN);
        let msgBuf = recvBuf.slice(DATA_TOTAL_LEN + PROTOCOLTYPE_LEN, recvBuf.byteLength);
        let classType = MessageRegister.getClass(protocolType);
        let msg = new classType(msgBuf);
        return msg;
    }

    /**
     * msg转buffer，封包用
     * 协议格式：总字节数（4个字节，总字节数=协议号字节数+数据长度） + 协议号（4个字节） + 数据长度
     * @param msg 
     */
    private msgToBuffer(msg) {
        let protocolType = msg.protocolType;
        let dataBuf = msg.toArrayBuffer();
        let dataView = new DataView(dataBuf);
        let dataLen = dataBuf.byteLength

        let sendBuf = new ArrayBuffer(DATA_TOTAL_LEN + PROTOCOLTYPE_LEN + dataLen);
        let sendView = new DataView(sendBuf);
        sendView.setInt32(0, PROTOCOLTYPE_LEN + dataLen);
        sendView.setInt32(DATA_TOTAL_LEN, protocolType);
        for (let i = 0; i < dataLen; i++) {
            sendView.setInt8(PROTOCOLTYPE_LEN + DATA_TOTAL_LEN + i, dataView.getInt8(i));
        }

        return sendBuf;
    }
}