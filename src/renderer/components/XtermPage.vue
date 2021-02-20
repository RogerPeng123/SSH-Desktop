<template>
    <div id="xterm" class="xterm"></div>
</template>
<script>
    import 'xterm/css/xterm.css'
    import {Terminal} from 'xterm'

    export default {
        name: "XtermPage",
        data() {
            return {
                socket: null,
                term: null,
                options: {},
                _connection: null
            }
        },
        props: {
            socketURI: {
                type: String,
                default: ''
            },
        },
        mounted() {
            this.initXterm();
        },
        beforeDestroy() {
            this.socket.close();
            this.term.dispose();
        },
        methods: {
            initXterm() {
                this.options = {
                    operate: 'connect',
                    host: '',
                    port: '',
                    username: '',
                    password: '',
                };

                let term = new Terminal({
                    cols: 97,
                    rows: 37,
                    cursorBlink: true, //光标闪烁
                    cursorStyle: "block", // 光标样式 null | block | underline | bar
                    scrollback: 800, // 回滚
                    tabStopWidth: 8, //制表宽度
                    screenKeys: true
                });

                term.onData(data => {
                    this.sendClientData(data);
                });

                term.open(document.getElementById('xterm'));

                //初始化等待链接
                term.write('正在链接....');

                let self = this;

                //执行链接操作
                this.connect({
                    onError: function (error) {
                        //链接失败回调
                        term.write('错误: ' + error + '\r\n');
                    },
                    onConnect: function () {
                        //链接成功回调
                        self.sendInitData(self.options);
                    },
                    onClose: function () {
                        //链接关闭回调
                        term.write("\r链接关闭");
                    },
                    onData: function (data) {
                        term.write(data)
                    }
                })
            },

            _generateEndpoint() {
                let protocol = '';
                if (window.location.protocol === 'https') {
                    protocol = 'wss://';
                } else {
                    protocol = 'ws://';
                }

                return protocol + '127.0.0.1:8080/webssh';
            },

            connect(options) {
                let endpoint = this._generateEndpoint();

                if (window.WebSocket) {
                    this._connection = new WebSocket(endpoint);
                } else {
                    options.onError("WebSocket Not Supported!");
                    return;
                }

                this._connection.onopen = function () {
                    options.onConnect();
                };

                this._connection.onmessage = function (evt) {
                    let data = evt.data.toString();
                    options.onData(data);
                };

                this._connection.onclose = function (evt) {
                    options.onClose();
                }
            },

            send(data) {
                this._connection.send(JSON.stringify(data));
            },

            sendInitData(options) {
                this._connection.send(JSON.stringify(options));
            },

            sendClientData(data) {
                this._connection.send(JSON.stringify({
                    "operate": "command",
                    "command": data
                }))
            }

        }
    }
</script>

<style scoped>
    .xterm {
        width: 100%;
        height: 100%;
    }
</style>
