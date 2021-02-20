<template>
    <div id="xterm" class="xterm"></div>
</template>
<script>
    import 'xterm/css/xterm.css'
    import {Terminal} from 'xterm'
    // import {FitAddon} from 'xterm-addon-fit'
    // import {AttachAddon} from 'xterm-addon-attach'
    import {WSSHClient} from './../WSSHClient/WsshClieentClass'

    export default {
        name: "XtermPage",
        data() {
            return {
                socket: null,
                term: null,
                options: {},
            }
        },
        props: {
            socketURI: {
                type: String,
                default: ''
            },
        },
        mounted() {
            this.initxterm();
        },
        beforeDestroy() {
            this.socket.close();
            this.term.dispose();
        },
        methods: {
            initxterm() {
                this.options = {
                    operate: 'connect',
                    host: '139.224.25.63',
                    port: '60022',
                    username: 'root',
                    password: '1qaz@WSX,.',
                };

                let client = new WSSHClient();
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
                    console.log('输入的是: ', data);
                    client.sendClientData(data);
                });

                term.open(document.getElementById('xterm'));

                //初始化等待链接
                term.write('Connecting....');

                //执行链接操作
                client.connect({
                    onError: function (error) {
                        //链接失败回调
                        term.write('Error: ' + error + '\r\n');
                    },
                    onConnect: function () {
                        //链接成功回调
                        client.sendInitData(this.options);
                    },
                    onClose: function () {
                        //链接关闭回调
                        term.write("\rconnection close");
                    },
                    onData: function (data) {
                        term.write(data)
                    }
                })
            },
            // initTerm() {
            //     const term = new Terminal({
            //         fontSize: 14,
            //         cursorBlink: true, //光标闪烁
            //         cursorStyle: "block", // 光标样式 null | block | underline | bar
            //         scrollback: 800, // 回滚
            //         tabStopWidth: 8, //制表宽度
            //     });
            //
            //     const attachAddon = new AttachAddon(this.socket);
            //     const fitAddon = new FitAddon();
            //     term.loadAddon(attachAddon);
            //     term.loadAddon(fitAddon);
            //     term.open(document.getElementById('xterm'));
            //     fitAddon.fit();
            //     term.focus();
            //     this.term = term
            // },
            // initSocket() {
            //     this.socket = new WebSocket(this.socketURI);
            //
            //     this.socketOnClose();
            //     this.socketOnOpen();
            //     this.socketOnError();
            // },
            // socketOnOpen() {
            //     this.socket.onopen = () => {
            //         // 链接成功后
            //         this.initTerm()
            //     }
            // },
            // socketOnClose() {
            //     this.socket.onclose = () => {
            //         // console.log('close socket')
            //     }
            // },
            // socketOnError() {
            //     this.socket.onerror = () => {
            //         // console.log('socket 链接失败')
            //     }
            // }
        }
    }
</script>

<style scoped>
    .xterm {
        width: 100%;
        height: 100%;
    }
</style>
