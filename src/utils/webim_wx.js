/* webim javascript SDK (for wechat miniProgram )
 * VER 1.7.2
 */
module.exports = function() {

    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function(callback) {
            for (var i = 0; i < this.length; i++) {
                callback.apply(this, [this[i], i, this]);
            }
        };
    }
    /* webim javascript SDK
     * VER 1.7.2
     */

    /* webim API definitions
     */
    var msgCache = {};
    var webim = { // namespace object webim

        login: function(loginInfo, listeners, options) {},
        syncMsgs: function(cbOk, cbErr) {},
        getC2CHistoryMsgs: function(options, cbOk, cbErr) {},
        syncGroupMsgs: function(options, cbOk, cbErr) {},
        sendMsg: function(msg, cbOk, cbErr) {},
        logout: function(cbOk, cbErr) {},
        setAutoRead: function(selSess, isOn, isResetAll) {},
        getProfilePortrait: function(options, cbOk, cbErr) {},
        setProfilePortrait: function(options, cbOk, cbErr) {},
        applyAddFriend: function(options, cbOk, cbErr) {},
        getPendency: function(options, cbOk, cbErr) {},
        deletePendency: function(options, cbOk, cbErr) {},
        responseFriend: function(options, cbOk, cbErr) {},
        getAllFriend: function(options, cbOk, cbErr) {},
        deleteFriend: function(options, cbOk, cbErr) {},
        addBlackList: function(options, cbOk, cbErr) {},
        getBlackList: function(options, cbOk, cbErr) {},
        deleteBlackList: function(options, cbOk, cbErr) {},
        uploadPic: function(options, cbOk, cbErr) {},
        createGroup: function(options, cbOk, cbErr) {},
        applyJoinGroup: function(options, cbOk, cbErr) {},
        handleApplyJoinGroup: function(options, cbOk, cbErr) {},
        deleteApplyJoinGroupPendency: function(options, cbOk, cbErr) {},
        quitGroup: function(options, cbOk, cbErr) {},
        getGroupPublicInfo: function(options, cbOk, cbErr) {},
        getGroupInfo: function(options, cbOk, cbErr) {},
        modifyGroupBaseInfo: function(options, cbOk, cbErr) {},
        destroyGroup: function(options, cbOk, cbErr) {},
        getJoinedGroupListHigh: function(options, cbOk, cbErr) {},
        getGroupMemberInfo: function(options, cbOk, cbErr) {},
        addGroupMember: function(options, cbOk, cbErr) {},
        modifyGroupMember: function(options, cbOk, cbErr) {},
        forbidSendMsg: function(options, cbOk, cbErr) {},
        deleteGroupMember: function(options, cbOk, cbErr) {},
        getPendencyGroup: function(options, cbOk, cbErr) {},
        getPendencyReport: function(options, cbOk, cbErr) {},
        getPendencyGroupRead: function(options, cbOk, cbErr) {},
        sendCustomGroupNotify: function(options, cbOk, cbErr) {},
        Msg: function(sess, isSend, seq, random, time, fromAccount, subType, fromAccountNick, fromAccountHeadurl) { /*Class constructor*/ },
        MsgStore: {
            /* function sessMap
             *   获取所有会话
             * return:
             *   所有会话对象
             */
            sessMap: function() {
                return { /*Object*/ };
            },
            /* function sessCount
             *   获取当前会话的个数
             * return:
             *   Integer, 会话个数
             */
            sessCount: function() {
                return 0;
            },

            /* function sessByTypeId
             *   根据会话类型和会话ID取得相应会话
             * params:
             *   type   - String, 会话类型(如"C2C", "GROUP", ...)
             *   id     - String, 会话ID(如对方ID)
             * return:
             *   Session, 会话对象(说明见上面)
             */
            sessByTypeId: function(type, id) {
                return { /*Session Object*/ };
            },
            /* function delSessByTypeId
             *   根据会话类型和会话ID删除相应会话
             * params:
             *   type   - String, 会话类型(如"C2C", "GROUP", ...)
             *   id     - String, 会话ID(如对方ID)
             * return:
             *   Boolean, 布尔类型
             */
            delSessByTypeId: function(type, id) {
                return true;
            },

            /* function resetCookieAndSyncFlag
             *   重置上一次读取新c2c消息Cookie和是否继续拉取标记
             * return:
             *
             */
            resetCookieAndSyncFlag: function() {},

            downloadMap: {}
        }

    };

    /* webim API implementation
     */
    (function(webim) {
        //sdk版本
        var SDK = {
            'VERSION': '1.7.2', //sdk版本号
            'APPID': '537048168', //web im sdk 版本 APPID
            'PLAATFORM': "10" //发送请求时判断其是来自web端的请求
        };

        //是否启用正式环境，默认启用
        var isAccessFormaEnvironment = true;
        // var isAccessFormaEnvironment = false;

        //后台接口主机
        var SRV_HOST = {
            'FORMAL': {
                'COMMON': 'https://webim.tim.qq.com',
                'PIC': 'https://pic.tim.qq.com'
            },
            'TEST': {
                'COMMON': 'https://test.tim.qq.com',
                'PIC': 'https://pic.tim.qq.com'
            }
        };

        //浏览器版本信息
        var BROWSER_INFO = {};
        //是否为ie9（含）以下
        var lowerBR = false;

        //服务名称
        var SRV_NAME = {
            'OPEN_IM': 'openim', //私聊（拉取未读c2c消息，长轮询，c2c消息已读上报等）服务名
            'GROUP': 'group_open_http_svc', //群组管理（拉取群消息，创建群，群成员管理，群消息已读上报等）服务名
            'FRIEND': 'sns', //关系链管理（好友管理，黑名单管理等）服务名
            'PROFILE': 'profile', //资料管理（查询，设置个人资料等）服务名
            'RECENT_CONTACT': 'recentcontact', //最近联系人服务名
            'PIC': 'openpic', //图片（或文件）服务名
            'BIG_GROUP': 'group_open_http_noauth_svc', //直播大群 群组管理（申请加大群）服务名
            'BIG_GROUP_LONG_POLLING': 'group_open_long_polling_http_noauth_svc', //直播大群 长轮询（拉取消息等）服务名
            'IM_OPEN_STAT': 'imopenstat', //质量上报，统计接口错误率
            'DEL_CHAT': 'recentcontact', //删除会话
            'WEB_IM': 'webim'
        };

        //不同服务对应的版本号
        var SRV_NAME_VER = {
            'openim': 'v4',
            'group_open_http_svc': 'v4',
            'sns': 'v4',
            'profile': 'v4',
            'recentcontact': 'v4',
            'openpic': 'v4',
            'group_open_http_noauth_svc': 'v1',
            'group_open_long_polling_http_noauth_svc': 'v1',
            'imopenstat': 'v4',
            'webim': 'v3'
        };

        //不同的命令名对应的上报类型ID，用于接口质量上报
        var CMD_EVENT_ID_MAP = {
            'login': 1, //登录
            'pic_up': 3, //上传图片
            'apply_join_group': 9, //申请加入群组
            'create_group': 10, //创建群组
            'longpolling': 18, //普通长轮询
            'send_group_msg': 19, //群聊
            'sendmsg': 20 //私聊
        };

        //聊天类型
        var SESSION_TYPE = {
            'C2C': 'C2C', //私聊
            'GROUP': 'GROUP' //群聊
        };

        //最近联系人类型
        var RECENT_CONTACT_TYPE = {
            'C2C': 1, //好友
            'GROUP': 2 //群
        };

        //消息最大长度（字节）
        var MSG_MAX_LENGTH = {
            'C2C': 12000, //私聊消息
            'GROUP': 8898 //群聊
        };

        //后台接口返回类型
        var ACTION_STATUS = {
            'OK': 'OK', //成功
            'FAIL': 'FAIL' //失败
        };

        var ERROR_CODE_CUSTOM = 99999; //自定义后台接口返回错误码

        //消息元素类型
        var MSG_ELEMENT_TYPE = {
            'TEXT': 'TIMTextElem', //文本
            'FACE': 'TIMFaceElem', //表情
            'IMAGE': 'TIMImageElem', //图片
            'CUSTOM': 'TIMCustomElem', //自定义
            'SOUND': 'TIMSoundElem', //语音,只支持显示
            'FILE': 'TIMFileElem', //文件,只支持显示
            'LOCATION': 'TIMLocationElem', //地理位置
            'GROUP_TIP': 'TIMGroupTipElem' //群提示消息,只支持显示
        };

        //图片类型
        var IMAGE_TYPE = {
            'ORIGIN': 1, //原图
            'LARGE': 2, //缩略大图
            'SMALL': 3 //缩略小图
        };

        //图片格式
        var IMAGE_FORMAT = {
            JPG: 0x1,
            JPEG: 0x1,
            GIF: 0x2,
            PNG: 0x3,
            BMP: 0x4,
            UNKNOWN: 0xff
        };


        //上传资源包类型
        var UPLOAD_RES_PKG_FLAG = {
            'RAW_DATA': 0, //原始数据
            'BASE64_DATA': 1 //base64编码数据
        };

        //下载文件配置
        var DOWNLOAD_FILE = {
            'BUSSINESS_ID': '10001', //下载文件业务ID
            'AUTH_KEY': '617574686b6579', //下载文件authkey
            'SERVER_IP': '182.140.186.147', //下载文件服务器IP
            'SOUND_SERVER_DOMAIN': 'grouptalk.c2c.qq.com'
        };

        //下载文件类型
        var DOWNLOAD_FILE_TYPE = {
            "SOUND": 2106, //语音
            "FILE": 2107 //普通文件
        };

        //上传资源类型
        var UPLOAD_RES_TYPE = {
            "IMAGE": 1, //图片
            "FILE": 2, //文件
            "SHORT_VIDEO": 3, //短视频
            "SOUND": 4 //语音，PTT
        };

        //版本号，用于上传图片或文件接口
        var VERSION_INFO = {
            'APP_VERSION': '2.1', //应用版本号
            'SERVER_VERSION': 1 //服务端版本号
        };

        //长轮询消息类型
        var LONG_POLLINNG_EVENT_TYPE = {
            "C2C": 1 //新的c2c消息通知
            ,
            "GROUP_COMMON": 3 //新的群普通消息
            ,
            "GROUP_TIP": 4 //新的群提示消息
            ,
            "GROUP_SYSTEM": 5 //新的群系统消息
            ,
            "GROUP_TIP2": 6 //新的群提示消息2
            ,
            "FRIEND_NOTICE": 7 //好友系统通知
            ,
            "PROFILE_NOTICE": 8 //资料系统通知
            ,
            "C2C_COMMON": 9 //新的C2C消息
            ,
            "C2C_EVENT": 10
        };

        //c2c消息子类型
        var C2C_MSG_SUB_TYPE = {
            "COMMON": 0 //普通消息
        };
        //c2c消息子类型
        var C2C_EVENT_SUB_TYPE = {
            "READED": 92, //已读消息同步
            "KICKEDOUT": 96
        };

        //群消息子类型
        var GROUP_MSG_SUB_TYPE = {
            "COMMON": 0, //普通消息
            "LOVEMSG": 1, //点赞消息
            "TIP": 2, //提示消息
            "REDPACKET": 3 //红包消息
        };

        //群消息优先级类型
        var GROUP_MSG_PRIORITY_TYPE = {
            "REDPACKET": 1, //红包消息
            "COMMON": 2, //普通消息
            "LOVEMSG": 3 //点赞消息
        };

        //群提示消息类型
        var GROUP_TIP_TYPE = {
            "JOIN": 1, //加入群组
            "QUIT": 2, //退出群组
            "KICK": 3, //被踢出群组
            "SET_ADMIN": 4, //被设置为管理员
            "CANCEL_ADMIN": 5, //被取消管理员
            "MODIFY_GROUP_INFO": 6, //修改群资料
            "MODIFY_MEMBER_INFO": 7 //修改群成员信息
        };

        //群提示消息-群资料变更类型
        var GROUP_TIP_MODIFY_GROUP_INFO_TYPE = {
            "FACE_URL": 1, //修改群头像URL
            "NAME": 2, //修改群名称
            "OWNER": 3, //修改群主
            "NOTIFICATION": 4, //修改群公告
            "INTRODUCTION": 5 //修改群简介
        };

        //群系统消息类型
        var GROUP_SYSTEM_TYPE = {
            "JOIN_GROUP_REQUEST": 1, //申请加群请求（只有管理员会收到）
            "JOIN_GROUP_ACCEPT": 2, //申请加群被同意（只有申请人能够收到）
            "JOIN_GROUP_REFUSE": 3, //申请加群被拒绝（只有申请人能够收到）
            "KICK": 4, //被管理员踢出群(只有被踢者接收到)
            "DESTORY": 5, //群被解散(全员接收)
            "CREATE": 6, //创建群(创建者接收, 不展示)
            "INVITED_JOIN_GROUP_REQUEST": 7, //邀请加群(被邀请者接收)
            "QUIT": 8, //主动退群(主动退出者接收, 不展示)
            "SET_ADMIN": 9, //设置管理员(被设置者接收)
            "CANCEL_ADMIN": 10, //取消管理员(被取消者接收)
            "REVOKE": 11, //群已被回收(全员接收, 不展示)
            "READED": 15, //群消息已读同步
            "CUSTOM": 255, //用户自定义通知(默认全员接收)
            "INVITED_JOIN_GROUP_REQUEST_AGREE": 12, //邀请加群(被邀请者需同意)
        };

        //好友系统通知子类型
        var FRIEND_NOTICE_TYPE = {
            "FRIEND_ADD": 1, //好友表增加
            "FRIEND_DELETE": 2, //好友表删除
            "PENDENCY_ADD": 3, //未决增加
            "PENDENCY_DELETE": 4, //未决删除
            "BLACK_LIST_ADD": 5, //黑名单增加
            "BLACK_LIST_DELETE": 6, //黑名单删除
            "PENDENCY_REPORT": 7, //未决已读上报
            "FRIEND_UPDATE": 8 //好友数据更新
        };

        //资料系统通知子类型
        var PROFILE_NOTICE_TYPE = {
            "PROFILE_MODIFY": 1 //资料修改
        };

        //腾讯登录服务错误码（用于托管模式）
        var TLS_ERROR_CODE = {
            'OK': 0, //成功
            'SIGNATURE_EXPIRATION': 11 //用户身份凭证过期
        };

        //长轮询连接状态
        var CONNECTION_STATUS = {
            'INIT': -1, //初始化
            'ON': 0, //连接正常
            'RECONNECT': 1, //连接恢复正常
            'OFF': 9999 //连接已断开,可能是用户网络问题，或者长轮询接口报错引起的
        };

        var UPLOAD_PIC_BUSSINESS_TYPE = { //图片业务类型
            'GROUP_MSG': 1, //私聊图片
            'C2C_MSG': 2, //群聊图片
            'USER_HEAD': 3, //用户头像
            'GROUP_HEAD': 4 //群头像
        };

        var FRIEND_WRITE_MSG_ACTION = { //好友输入消息状态
            'ING': 14, //正在输入
            'STOP': 15 //停止输入
        };

        //ajax默认超时时间，单位：毫秒
        var ajaxDefaultTimeOut = 15000;

        //大群长轮询接口返回正常时，延时一定时间再发起下一次请求
        var OK_DELAY_TIME = 1000;

        //大群长轮询接口发生错误时，延时一定时间再发起下一次请求
        var ERROR_DELAY_TIME = 5000;

        //群提示消息最多显示人数
        var GROUP_TIP_MAX_USER_COUNT = 10;

        //长轮询连接状态
        var curLongPollingStatus = CONNECTION_STATUS.INIT;

        //当长轮询连接断开后，是否已经回调过
        var longPollingOffCallbackFlag = false;

        //当前长轮询返回错误次数
        var curLongPollingRetErrorCount = 0;

        //长轮询默认超时时间，单位：毫秒
        var longPollingDefaultTimeOut = 60000;

        //长轮询返回错误次数达到一定值后，发起新的长轮询请求间隔时间，单位：毫秒
        var longPollingIntervalTime = 5000;

        //没有新消息时，长轮询返回60008错误码是正常的
        var longPollingTimeOutErrorCode = 60008;

        //多实例登录被kick的错误码
        var longPollingKickedErrorCode = 91101;

        var longPollingPackageTooLargeErrorCode = 10018;
        var LongPollingId = null;

        //当前大群长轮询返回错误次数
        var curBigGroupLongPollingRetErrorCount = 0;

        //最大允许长轮询返回错误次数
        var LONG_POLLING_MAX_RET_ERROR_COUNT = 10;

        //上传重试累计
        var Upload_Retry_Times = 0;
        //最大上传重试
        var Upload_Retry_Max_Times = 20;


        var uploadResultIframeId = 0; //用于上传图片的iframe id

        var ipList = []; //文件下载地址
        var authkey = null; //文件下载票据
        var expireTime = null; //文件下载票据超时时间

        //错误码
        var ERROR = {};
        //当前登录用户
        var ctx = {
            sdkAppID: null,
            appIDAt3rd: null,
            accountType: null,
            identifier: null,
            tinyid: null,
            identifierNick: null,
            userSig: null,
            a2: null,
            contentType: 'json',
            apn: 1
        };
        var opt = {};
        var xmlHttpObjSeq = 0; //ajax请求id
        var xmlHttpObjMap = {}; //发起的ajax请求
        var curSeq = 0; //消息seq
        var tempC2CMsgList = []; //新c2c消息临时缓存
        var tempC2CHistoryMsgList = []; //漫游c2c消息临时缓存

        var maxApiReportItemCount = 20; //一次最多上报条数
        var apiReportItems = []; //暂存api接口质量上报数据

        var Resources = {
            downloadMap: {}
        };

        //表情标识字符和索引映射关系对象，用户可以自定义
        var emotionDataIndexs = {
            "[惊讶]": 0,
            "[撇嘴]": 1,
            "[色]": 2,
            "[发呆]": 3,
            "[得意]": 4,
            "[流泪]": 5,
            "[害羞]": 6,
            "[闭嘴]": 7,
            "[睡]": 8,
            "[大哭]": 9,
            "[尴尬]": 10,
            "[发怒]": 11,
            "[调皮]": 12,
            "[龇牙]": 13,
            "[微笑]": 14,
            "[难过]": 15,
            "[酷]": 16,
            "[冷汗]": 17,
            "[抓狂]": 18,
            "[吐]": 19,
            "[偷笑]": 20,
            "[可爱]": 21,
            "[白眼]": 22,
            "[傲慢]": 23,
            "[饿]": 24,
            "[困]": 25,
            "[惊恐]": 26,
            "[流汗]": 27,
            "[憨笑]": 28,
            "[大兵]": 29,
            "[奋斗]": 30,
            "[咒骂]": 31,
            "[疑问]": 32,
            "[嘘]": 33,
            "[晕]": 34
        };

        //表情对象，用户可以自定义
        var emotions = {};
        //工具类
        var tool = new function() {

                //格式化时间戳
                //format格式如下：
                //yyyy-MM-dd hh:mm:ss 年月日时分秒(默认格式)
                //yyyy-MM-dd 年月日
                //hh:mm:ss 时分秒
                this.formatTimeStamp = function(timestamp, format) {
                    if (!timestamp) {
                        return 0;
                    }
                    var formatTime;
                    format = format || 'yyyy-MM-dd hh:mm:ss';
                    var date = new Date(timestamp * 1000);
                    var o = {
                        "M+": date.getMonth() + 1, //月份
                        "d+": date.getDate(), //日
                        "h+": date.getHours(), //小时
                        "m+": date.getMinutes(), //分
                        "s+": date.getSeconds() //秒
                    };
                    if (/(y+)/.test(format)) {
                        formatTime = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                    } else {
                        formatTime = format;
                    }
                    for (var k in o) {
                        if (new RegExp("(" + k + ")").test(formatTime))
                            formatTime = formatTime.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                    return formatTime;
                };

                //根据群类型英文名转换成中文名
                this.groupTypeEn2Ch = function(type_en) {
                    var type_ch = null;
                    switch (type_en) {
                        case 'Public':
                            type_ch = '公开群';
                            break;
                        case 'ChatRoom':
                            type_ch = '聊天室';
                            break;
                        case 'Private':
                            type_ch = '私有群'; //即讨论组
                            break;
                        case 'AVChatRoom':
                            type_ch = '直播聊天室';
                            break;
                        default:
                            type_ch = type_en;
                            break;
                    }
                    return type_ch;
                };
                //根据群类型中文名转换成英文名
                this.groupTypeCh2En = function(type_ch) {
                    var type_en = null;
                    switch (type_ch) {
                        case '公开群':
                            type_en = 'Public';
                            break;
                        case '聊天室':
                            type_en = 'ChatRoom';
                            break;
                        case '私有群': //即讨论组
                            type_en = 'Private';
                            break;
                        case '直播聊天室':
                            type_en = 'AVChatRoom';
                            break;
                        default:
                            type_en = type_ch;
                            break;
                    }
                    return type_en;
                };
                //根据群身份英文名转换成群身份中文名
                this.groupRoleEn2Ch = function(role_en) {
                    var role_ch = null;
                    switch (role_en) {
                        case 'Member':
                            role_ch = '成员';
                            break;
                        case 'Admin':
                            role_ch = '管理员';
                            break;
                        case 'Owner':
                            role_ch = '群主';
                            break;
                        default:
                            role_ch = role_en;
                            break;
                    }
                    return role_ch;
                };
                //根据群身份中文名转换成群身份英文名
                this.groupRoleCh2En = function(role_ch) {
                    var role_en = null;
                    switch (role_ch) {
                        case '成员':
                            role_en = 'Member';
                            break;
                        case '管理员':
                            role_en = 'Admin';
                            break;
                        case '群主':
                            role_en = 'Owner';
                            break;
                        default:
                            role_en = role_ch;
                            break;
                    }
                    return role_en;
                };
                //根据群消息提示类型英文转换中文
                this.groupMsgFlagEn2Ch = function(msg_flag_en) {
                    var msg_flag_ch = null;
                    switch (msg_flag_en) {
                        case 'AcceptAndNotify':
                            msg_flag_ch = '接收并提示';
                            break;
                        case 'AcceptNotNotify':
                            msg_flag_ch = '接收不提示';
                            break;
                        case 'Discard':
                            msg_flag_ch = '屏蔽';
                            break;
                        default:
                            msg_flag_ch = msg_flag_en;
                            break;
                    }
                    return msg_flag_ch;
                };
                //根据群消息提示类型中文名转换英文名
                this.groupMsgFlagCh2En = function(msg_flag_ch) {
                    var msg_flag_en = null;
                    switch (msg_flag_ch) {
                        case '接收并提示':
                            msg_flag_en = 'AcceptAndNotify';
                            break;
                        case '接收不提示':
                            msg_flag_en = 'AcceptNotNotify';
                            break;
                        case '屏蔽':
                            msg_flag_en = 'Discard';
                            break;
                        default:
                            msg_flag_en = msg_flag_ch;
                            break;
                    }
                    return msg_flag_en;
                };
                //将空格和换行符转换成HTML标签
                this.formatText2Html = function(text) {
                    var html = text;
                    if (html) {
                        html = this.xssFilter(html); //用户昵称或群名称等字段会出现脚本字符串
                        html = html.replace(/ /g, "&nbsp;");
                        html = html.replace(/\n/g, "<br/>");
                    }
                    return html;
                };
                //将HTML标签转换成空格和换行符
                this.formatHtml2Text = function(html) {
                    var text = html;
                    if (text) {
                        text = text.replace(/&nbsp;/g, " ");
                        text = text.replace(/<br\/>/g, "\n");
                    }
                    return text;
                };
                //获取字符串(UTF-8编码)所占字节数
                //参考：http://zh.wikipedia.org/zh-cn/UTF-8
                this.getStrBytes = function(str) {
                    if (str == null || str === undefined) return 0;
                    if (typeof str != "string") {
                        return 0;
                    }
                    var total = 0,
                        charCode, i, len;
                    for (i = 0, len = str.length; i < len; i++) {
                        charCode = str.charCodeAt(i);
                        if (charCode <= 0x007f) {
                            total += 1; //字符代码在000000 – 00007F之间的，用一个字节编码
                        } else if (charCode <= 0x07ff) {
                            total += 2; //000080 – 0007FF之间的字符用两个字节
                        } else if (charCode <= 0xffff) {
                            total += 3; //000800 – 00D7FF 和 00E000 – 00FFFF之间的用三个字节，注: Unicode在范围 D800-DFFF 中不存在任何字符
                        } else {
                            total += 4; //010000 – 10FFFF之间的用4个字节
                        }
                    }
                    return total;
                };


                //防止XSS攻击
                this.xssFilter = function(val) {
                    val = val.toString();
                    val = val.replace(/[<]/g, "&lt;");
                    val = val.replace(/[>]/g, "&gt;");
                    val = val.replace(/"/g, "&quot;");
                    //val = val.replace(/'/g, "&#039;");
                    return val;
                };

                //去掉头尾空白符
                this.trimStr = function(str) {
                    if (!str) return '';
                    str = str.toString();
                    return str.replace(/(^\s*)|(\s*$)/g, "");
                };
                //判断是否为8位整数
                this.validNumber = function(str) {
                    str = str.toString();
                    return str.match(/(^\d{1,8}$)/g);
                };
                this.getReturnError = function(errorInfo, errorCode) {
                    if (!errorCode) {
                        errorCode = -100;
                    }
                    var error = {
                        'ActionStatus': ACTION_STATUS.FAIL,
                        'ErrorCode': errorCode,
                        'ErrorInfo': errorInfo + "[" + errorCode + "]"
                    };
                    return error;
                };
                this.replaceObject = function(keyMap, json) {
                    for (var a in json) {
                        if (keyMap[a]) {
                            json[keyMap[a]] = json[a]
                            delete json[a]
                            if (json[keyMap[a]] instanceof Array) {
                                var len = json[keyMap[a]].length
                                for (var i = 0; i < len; i++) {
                                    json[keyMap[a]][i] = this.replaceObject(keyMap, json[keyMap[a]][i])
                                }
                            } else if (typeof json[keyMap[a]] === 'object') {
                                json[keyMap[a]] = this.replaceObject(keyMap, json[keyMap[a]])
                            }
                        }
                    }
                    return json;
                }
            };

        //日志对象
        var log = new function() {

                var on = true;

                this.setOn = function(onFlag) {
                    on = onFlag;
                };

                this.getOn = function() {
                    return on;
                };

                this.error = function(logStr) {
                    try {
                        on && console.error(logStr);
                    } catch (e) {}
                };
                this.warn = function(logStr) {
                    try {
                        on && console.warn(logStr);
                    } catch (e) {}
                };
                this.info = function(logStr) {
                    try {
                        on && console.info(logStr);
                    } catch (e) {}
                };
                this.debug = function(logStr) {
                    try {
                        on && console.debug(logStr);
                    } catch (e) {}
                };
            };
        //获取unix时间戳
        var unixtime = function(d) {
            if (!d) d = new Date();
            return Math.round(d.getTime() / 1000);
        };
        //时间戳转日期
        var fromunixtime = function(t) {
            return new Date(t * 1000);
        };
        //获取下一个消息序号
        var nextSeq = function() {
            if (curSeq) {
                curSeq = curSeq + 1;
            } else {
                curSeq = Math.round(Math.random() * 10000000);
            }
            return curSeq;
        };
        //产生随机数
        var createRandom = function() {
            return Math.round(Math.random() * 4294967296);
        };

        //发起ajax请求
        var ajaxRequest = function(meth, url, req, timeout, isLongPolling, cbOk, cbErr) {

            wx.request({
                url: url,
                data: req,
                dataType: 'json',
                method: meth,
                header: {
                    'Content-Type': 'application/json'
                },
                success: function(res) {
                    curLongPollingRetErrorCount = curBigGroupLongPollingRetErrorCount = 0;
                    if (cbOk) cbOk(res.data);
                },
                fail: function(res) {
                    setTimeout(function() {
                        var errInfo = "请求服务器失败,请检查你的网络是否正常";
                        var error = tool.getReturnError(errInfo, -2);
                        //if (!isLongPolling && cbErr) cbErr(error);
                        if (cbErr) cbErr(error);
                    }, 16);
                }
            });
        }

        //发起ajax请求（json格式数据）
        var ajaxRequestJson = function(meth, url, req, timeout, isLongPolling, cbOk, cbErr) {
            ajaxRequest(meth, url, JSON.stringify(req), timeout, isLongPolling, function(resp) {
                var json = null;
                if (resp) json = resp; //将返回的json字符串转换成json对象
                if (cbOk) cbOk(json);
            }, cbErr);
        }
        //判断用户是否已登录
        var isLogin = function() {
            return ctx.sdkAppID && ctx.identifier;
        };
        //检查是否登录
        var checkLogin = function(cbErr, isNeedCallBack) {
            if (!isLogin()) {
                if (isNeedCallBack) {
                    var errInfo = "请登录";
                    var error = tool.getReturnError(errInfo, -4);

                    if (cbErr) cbErr(error);
                }
                return false;
            }
            return true;
        };

        //检查是否访问正式环境
        var isAccessFormalEnv = function() {
            return isAccessFormaEnvironment;
        };

        //根据不同的服务名和命令，获取对应的接口地址
        var getApiUrl = function(srvName, cmd, cbOk, cbErr) {
            var srvHost = SRV_HOST;
            if (isAccessFormalEnv()) {
                srvHost = SRV_HOST.FORMAL.COMMON;
            } else {
                srvHost = SRV_HOST.TEST.COMMON;
            }

            //if (srvName == SRV_NAME.RECENT_CONTACT) {
            //    srvHost = SRV_HOST.TEST.COMMON;
            //}

            if (srvName == SRV_NAME.PIC) {
                if (isAccessFormalEnv()) {
                    srvHost = SRV_HOST.FORMAL.PIC;
                } else {
                    srvHost = SRV_HOST.TEST.PIC;
                }
            }

            var url = srvHost + '/' + SRV_NAME_VER[srvName] + '/' + srvName + '/' + cmd + '?websdkappid=' + SDK.APPID + "&v=" + SDK.VERSION + "&platform=" + SDK.PLAATFORM;;

            if (isLogin()) {
                if (cmd == 'login' || cmd == 'accesslayer') {
                    url += '&identifier=' + encodeURIComponent(ctx.identifier) + '&usersig=' + ctx.userSig;
                } else {
                    if (ctx.tinyid && ctx.a2) {
                        url += '&tinyid=' + ctx.tinyid + '&a2=' + ctx.a2;
                    } else {
                        if (cbErr) {
                            log.error("tinyid或a2为空[" + srvName + "][" + cmd + "]");
                            cbErr(tool.getReturnError("tinyid或a2为空[" + srvName + "][" + cmd + "]", -5));
                            return false;
                        }
                    }
                }
                url += '&contenttype=' + ctx.contentType;
            }
            url += '&sdkappid=' + ctx.sdkAppID + '&accounttype=' + ctx.accountType + '&apn=' + ctx.apn + '&reqtime=' + unixtime();
            return url;
        };

        //获取语音下载url
        var getSoundDownUrl = function(uuid, senderId) {
            var soundUrl = null;
            if (authkey && ipList[0]) {
                // soundUrl = "http://" + ipList[0] + "/asn.com/stddownload_common_file?authkey=" + authkey + "&bid=" + DOWNLOAD_FILE.BUSSINESS_ID + "&subbid=" + ctx.sdkAppID + "&fileid=" + uuid + "&filetype=" + DOWNLOAD_FILE_TYPE.SOUND + "&openid=" + senderId + "&ver=0";
                soundUrl = "https://" + DOWNLOAD_FILE.SOUND_SERVER_DOMAIN + "/asn.com/stddownload_common_file?authkey=" + authkey + "&bid=" + DOWNLOAD_FILE.BUSSINESS_ID + "&subbid=" + ctx.sdkAppID + "&fileid=" + uuid + "&filetype=" + DOWNLOAD_FILE_TYPE.SOUND + "&openid=" + senderId + "&ver=0";
            } else {
                log.error("拼接语音下载url不报错：ip或者authkey为空");
            }
            return soundUrl;
        };

        //获取文件下载地址
        var getFileDownUrl = function(uuid, senderId, fileName) {
            var fileUrl = null;
            if (authkey && ipList[0]) {
                fileUrl = "http://" + ipList[0] + "/asn.com/stddownload_common_file?authkey=" + authkey + "&bid=" + DOWNLOAD_FILE.BUSSINESS_ID + "&subbid=" + ctx.sdkAppID + "&fileid=" + uuid + "&filetype=" + DOWNLOAD_FILE_TYPE.FILE + "&openid=" + senderId + "&ver=0&filename=" + encodeURIComponent(fileName);
            } else {
                log.error("拼接文件下载url不报错：ip或者authkey为空");
            }
            Resources.downloadMap["uuid_" + uuid] = fileUrl;
            return fileUrl;
        };

        //获取文件下载地址
        var getFileDownUrlV2 = function(uuid, senderId, fileName, downFlag, receiverId, busiId, type) {
            var options = {
                "From_Account": senderId, //"identifer_0",       // 类型: String, 发送者tinyid
                "To_Account": receiverId, //"identifer_1",         // 类型: String, 接收者tinyid
                "os_platform": 10, // 类型: Number, 终端的类型 1(android) 2(ios) 3(windows) 10(others...)
                "Timestamp": unixtime().toString(), // 类型: Number, 时间戳
                "Random": createRandom().toString(), // 类型: Number, 随机值
                "request_info": [ // 类型: Array
                    {
                        "busi_id": busiId, // 类型: Number, 群(1) C2C(2) 其他请联系sdk开发者分配
                        "download_flag": downFlag, // 类型: Number, 申请下载地址标识  0(申请架平下载地址)  1(申请COS平台下载地址)  2(不需要申请, 直接拿url下载(这里应该不会为2))
                        "type": type, // 类型: Number, 0(短视频缩略图), 1(文件), 2(短视频), 3(ptt), 其他待分配
                        "uuid": uuid, // 类型: Number, 唯一标识一个文件的uuid
                        "version": VERSION_INFO.SERVER_VERSION, // 类型: Number, 架平server版本
                        "auth_key": authkey, // 类型: String, 认证签名
                        "ip": ipList[0] // 类型: Number, 架平IP
                    }
                ]
            };
            //获取下载地址
            proto_applyDownload(options, function(resp) {
                if (resp.error_code == 0 && resp.response_info) {
                    Resources.downloadMap["uuid_" + options.uuid] = resp.response_info.url;
                }
                if (onAppliedDownloadUrl) {
                    onAppliedDownloadUrl({
                        uuid: options.uuid,
                        url: resp.response_info.url,
                        maps: Resources.downloadMap
                    });
                }
            }, function(resp) {
                log.error("获取下载地址失败", options.uuid)
            });
        };


        //重置ajax请求
        var clearXmlHttpObjMap = function() {
            //遍历xmlHttpObjMap{}
            for (var seq in xmlHttpObjMap) {
                var xmlHttpObj = xmlHttpObjMap[seq];
                if (xmlHttpObj) {
                    xmlHttpObj.abort(); //中断ajax请求(长轮询)
                    xmlHttpObjMap[xmlHttpObjSeq] = null; //清空
                }
            }
            xmlHttpObjSeq = 0;
            xmlHttpObjMap = {};
        };

        //重置sdk全局变量
        var clearSdk = function() {

            clearXmlHttpObjMap();

            //当前登录用户
            ctx = {
                sdkAppID: null,
                appIDAt3rd: null,
                accountType: null,
                identifier: null,
                identifierNick: null,
                userSig: null,
                contentType: 'json',
                apn: 1
            };
            opt = {};

            curSeq = 0;


            apiReportItems = [];

            MsgManager.clear();
            MsgStore.clear();

            //重置longpollingId
            LongPollingId = null;
        };

        //登录
        var _login = function(loginInfo, listeners, options, cbOk, cbErr) {

            clearSdk();

            if (options) opt = options;
            if (opt.isAccessFormalEnv == false) {
                log.error("请切换为正式环境！！！！");
                isAccessFormaEnvironment = opt.isAccessFormalEnv;
            }
            if (opt.isLogOn == false) {
                log.setOn(opt.isLogOn);
            }
            /*
             if(opt.emotions){
             emotions=opt.emotions;
             webim.Emotions= emotions;
             }
             if(opt.emotionDataIndexs){
             emotionDataIndexs=opt.emotionDataIndexs;
             webim.EmotionDataIndexs= emotionDataIndexs;
             }*/

            if (!loginInfo) {
                if (cbErr) {
                    cbErr(tool.getReturnError("loginInfo is empty", -6));
                    return;
                }
            }
            if (!loginInfo.sdkAppID) {
                if (cbErr) {
                    cbErr(tool.getReturnError("loginInfo.sdkAppID is empty", -7));
                    return;
                }
            }
            if (!loginInfo.accountType) {
                if (cbErr) {
                    cbErr(tool.getReturnError("loginInfo.accountType is empty", -8));
                    return;
                }
            }

            if (loginInfo.identifier) {
                ctx.identifier = loginInfo.identifier.toString();
            }
            if (loginInfo.identifier && !loginInfo.userSig) {
                if (cbErr) {
                    cbErr(tool.getReturnError("loginInfo.userSig is empty", -9));
                    return;
                }
            }
            if (loginInfo.userSig) {
                ctx.userSig = loginInfo.userSig.toString();
            }
            ctx.sdkAppID = loginInfo.sdkAppID;
            ctx.accountType = loginInfo.accountType;

            if (ctx.identifier && ctx.userSig) { //带登录态
                proto_accesslayer(function() {
                    //登录
                    proto_login(
                        function(identifierNick, headurl) {
                            MsgManager.init(
                                listeners,
                                function(mmInitResp) {
                                    if (cbOk) {
                                        mmInitResp.identifierNick = identifierNick;
                                        mmInitResp.headurl = headurl;
                                        cbOk(mmInitResp);
                                    }
                                }, cbErr
                            );
                        },
                        cbErr
                    );
                })
            } else { //不带登录态，进入直播场景sdk
                MsgManager.init(
                    listeners,
                    cbOk,
                    cbErr
                );
            }
        };

        //初始化浏览器信息
        var initBrowserInfo = function() {
            //初始化浏览器类型
            BROWSER_INFO = "wechat"
        };

        var proto_accesslayer = function(callback) {
            ConnManager.apiCall(SRV_NAME.WEB_IM, "accesslayer", {}, function(data) {
                if (data.ErrorCode === 0 && data.WebImAccessLayer === 1) {
                    SRV_HOST.FORMAL.COMMON = 'https://events.tim.qq.com';
                }
                callback();
            }, function() {
                callback();
            });
        };
        // REST API calls
        //上线
        var proto_login = function(cbOk, cbErr) {
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "login", {
                    "State": "Online"
                },
                function(loginResp) {
                    if (loginResp.TinyId) {
                        ctx.tinyid = loginResp.TinyId;
                    } else {
                        if (cbErr) {
                            cbErr(tool.getReturnError("TinyId is empty", -10));
                            return;
                        }
                    }
                    if (loginResp.A2Key) {
                        ctx.a2 = loginResp.A2Key;
                    } else {
                        if (cbErr) {
                            cbErr(tool.getReturnError("A2Key is empty", -11));
                            return;
                        }
                    }
                    var tag_list = [
                        "Tag_Profile_IM_Nick",
                        "Tag_Profile_IM_Image"
                    ];
                    var options = {
                        'From_Account': ctx.identifier,
                        'To_Account': [ctx.identifier],
                        'LastStandardSequence': 0,
                        'TagList': tag_list
                    };
                    proto_getProfilePortrait(
                        options,
                        function(resp) {
                            var nick, image;
                            if (resp.UserProfileItem && resp.UserProfileItem.length > 0) {
                                for (var i in resp.UserProfileItem) {
                                    for (var j in resp.UserProfileItem[i].ProfileItem) {
                                        switch (resp.UserProfileItem[i].ProfileItem[j].Tag) {
                                            case 'Tag_Profile_IM_Nick':
                                                nick = resp.UserProfileItem[i].ProfileItem[j].Value;
                                                if (nick) ctx.identifierNick = nick;
                                                break;
                                            case 'Tag_Profile_IM_Image':
                                                image = resp.UserProfileItem[i].ProfileItem[j].Value;
                                                if (image) ctx.headurl = image;
                                                break;
                                        }
                                    }
                                }
                            }
                            if (cbOk) cbOk(ctx.identifierNick, ctx.headurl); //回传当前用户昵称
                        }, cbErr);
                }, cbErr);
        };
        //下线
        var proto_logout = function(type, cbOk, cbErr) {
            if (!checkLogin(cbErr, false)) { //不带登录态
                clearSdk();
                if (cbOk) cbOk({
                    'ActionStatus': ACTION_STATUS.OK,
                    'ErrorCode': 0,
                    'ErrorInfo': 'logout success'
                });
                return;
            }
            if (type == "all") {
                ConnManager.apiCall(SRV_NAME.OPEN_IM, "logout", {},
                    function(resp) {
                        clearSdk();
                        if (cbOk) cbOk(resp);
                    },
                    cbErr);
            } else {
                ConnManager.apiCall(SRV_NAME.OPEN_IM, "longpollinglogout", {
                        LongPollingId: LongPollingId
                    },
                    function(resp) {
                        clearSdk();
                        if (cbOk) cbOk(resp);
                    },
                    cbErr);
            }
        };
        //发送消息，包括私聊和群聊
        var proto_sendMsg = function(msg, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            var msgInfo = null;

            switch (msg.sess.type()) {
                case SESSION_TYPE.C2C:
                    msgInfo = {
                        'From_Account': ctx.identifier,
                        'To_Account': msg.sess.id().toString(),
                        'MsgTimeStamp': msg.time,
                        'MsgSeq': msg.seq,
                        'MsgRandom': msg.random,
                        'MsgBody': [],
                        'OfflinePushInfo': msg.offlinePushInfo
                    };
                    break;
                case SESSION_TYPE.GROUP:
                    var subType = msg.getSubType();
                    msgInfo = {
                        'GroupId': msg.sess.id().toString(),
                        'From_Account': ctx.identifier,
                        'Random': msg.random,
                        'MsgBody': []
                    };
                    switch (subType) {
                        case GROUP_MSG_SUB_TYPE.COMMON:
                            msgInfo.MsgPriority = "COMMON";
                            break;
                        case GROUP_MSG_SUB_TYPE.REDPACKET:
                            msgInfo.MsgPriority = "REDPACKET";
                            break;
                        case GROUP_MSG_SUB_TYPE.LOVEMSG:
                            msgInfo.MsgPriority = "LOVEMSG";
                            break;
                        case GROUP_MSG_SUB_TYPE.TIP:
                            log.error("不能主动发送群提示消息,subType=" + subType);
                            break;
                        default:
                            log.error("发送群消息时，出现未知子消息类型：subType=" + subType);
                            return;
                            break;
                    }
                    break;
                default:
                    break;
            }

            for (var i in msg.elems) {
                var elem = msg.elems[i];
                var msgContent = null;
                var msgType = elem.type;
                switch (msgType) {
                    case MSG_ELEMENT_TYPE.TEXT: //文本
                        msgContent = {
                            'Text': elem.content.text
                        };
                        break;
                    case MSG_ELEMENT_TYPE.FACE: //表情
                        msgContent = {
                            'Index': elem.content.index,
                            'Data': elem.content.data
                        };
                        break;
                    case MSG_ELEMENT_TYPE.IMAGE: //图片
                        var ImageInfoArray = [];
                        for (var j in elem.content.ImageInfoArray) {
                            ImageInfoArray.push({
                                'Type': elem.content.ImageInfoArray[j].type,
                                'Size': elem.content.ImageInfoArray[j].size,
                                'Width': elem.content.ImageInfoArray[j].width,
                                'Height': elem.content.ImageInfoArray[j].height,
                                'URL': elem.content.ImageInfoArray[j].url
                            });
                        }
                        msgContent = {
                            'ImageFormat': elem.content.ImageFormat,
                            'UUID': elem.content.UUID,
                            'ImageInfoArray': ImageInfoArray
                        };
                        break;
                    case MSG_ELEMENT_TYPE.SOUND: //
                        log.warn('web端暂不支持发送语音消息');
                        continue;
                        break;
                    case MSG_ELEMENT_TYPE.LOCATION: //
                        log.warn('web端暂不支持发送地理位置消息');
                        continue;
                        break;
                    case MSG_ELEMENT_TYPE.FILE: //
                        msgContent = {
                            'UUID': elem.content.uuid,
                            'FileName': elem.content.name,
                            'FileSize': elem.content.size,
                            'DownloadFlag': elem.content.downFlag
                        };
                        break;
                    case MSG_ELEMENT_TYPE.CUSTOM: //
                        msgContent = {
                            'Data': elem.content.data,
                            'Desc': elem.content.desc,
                            'Ext': elem.content.ext
                        };
                        msgType = MSG_ELEMENT_TYPE.CUSTOM;
                        break;
                    default:
                        log.warn('web端暂不支持发送' + elem.type + '消息');
                        continue;
                        break;
                }

                if (msg.PushInfoBoolean) {
                    msgInfo.OfflinePushInfo = msg.PushInfo; //当android终端进程被杀掉时才走push，IOS退到后台即可
                }

                msgInfo.MsgBody.push({
                    'MsgType': msgType,
                    'MsgContent': msgContent
                });
            }
            if (msg.sess.type() == SESSION_TYPE.C2C) { //私聊
                ConnManager.apiCall(SRV_NAME.OPEN_IM, "sendmsg", msgInfo, cbOk, cbErr);
            } else if (msg.sess.type() == SESSION_TYPE.GROUP) { //群聊
                ConnManager.apiCall(SRV_NAME.GROUP, "send_group_msg", msgInfo, cbOk, cbErr);
            }
        };
        //长轮询接口
        var proto_longPolling = function(options, cbOk, cbErr) {
            if (!isAccessFormaEnvironment && typeof stopPolling != "undefined" && stopPolling == true) {
                return;
            }
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "longpolling", options, cbOk, cbErr, longPollingDefaultTimeOut, true);
        };

        //长轮询接口(拉取直播聊天室新消息)
        var proto_bigGroupLongPolling = function(options, cbOk, cbErr, timeout) {
            ConnManager.apiCall(SRV_NAME.BIG_GROUP_LONG_POLLING, "get_msg", options, cbOk, cbErr, timeout);
        };

        //拉取未读c2c消息接口
        var proto_getMsgs = function(cookie, syncFlag, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "getmsg", {
                    'Cookie': cookie,
                    'SyncFlag': syncFlag
                },
                function(resp) {

                    if (resp.MsgList && resp.MsgList.length) {
                        for (var i in resp.MsgList) {
                            tempC2CMsgList.push(resp.MsgList[i]);
                        }
                    }
                    if (resp.SyncFlag == 1) {
                        proto_getMsgs(resp.Cookie, resp.SyncFlag, cbOk, cbErr);
                    } else {
                        resp.MsgList = tempC2CMsgList;
                        tempC2CMsgList = [];
                        if (cbOk) cbOk(resp);
                    }
                },
                cbErr);
        };
        //C2C消息已读上报接口
        var proto_c2CMsgReaded = function(cookie, c2CMsgReadedItem, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            var tmpC2CMsgReadedItem = [];
            for (var i in c2CMsgReadedItem) {
                var item = {
                    'To_Account': c2CMsgReadedItem[i].toAccount,
                    'LastedMsgTime': c2CMsgReadedItem[i].lastedMsgTime,
                    "Receipt": isPeerRead
                };
                tmpC2CMsgReadedItem.push(item);
            }
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "msgreaded", {
                C2CMsgReaded: {
                    'Cookie': cookie,
                    'C2CMsgReadedItem': tmpC2CMsgReadedItem
                }
            }, cbOk, cbErr);
        };

        //删除c2c消息
        var proto_deleteC2CMsg = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;

            ConnManager.apiCall(SRV_NAME.OPEN_IM, "deletemsg", options,
                cbOk, cbErr);
        };

        //拉取c2c历史消息接口
        var proto_getC2CHistoryMsgs = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "getroammsg", options,
                function(resp) {
                    var reqMsgCount = options.MaxCnt;
                    var complete = resp.Complete;
                    var rspMsgCount = resp.MaxCnt;
                    var msgKey = resp.MsgKey;
                    var lastMsgTime = resp.LastMsgTime;

                    if (resp.MsgList && resp.MsgList.length) {
                        for (var i in resp.MsgList) {
                            tempC2CHistoryMsgList.push(resp.MsgList[i]);
                        }
                    }
                    var netxOptions = null;
                    if (complete == 0) { //还有历史消息可拉取
                        if (rspMsgCount < reqMsgCount) {
                            netxOptions = {
                                'Peer_Account': options.Peer_Account,
                                'MaxCnt': reqMsgCount - rspMsgCount,
                                'LastMsgTime': lastMsgTime,
                                'MsgKey': msgKey
                            };
                        }
                    }

                    if (netxOptions) { //继续拉取
                        proto_getC2CHistoryMsgs(netxOptions, cbOk, cbErr);
                    } else {
                        resp.MsgList = tempC2CHistoryMsgList;
                        tempC2CHistoryMsgList = [];
                        if (cbOk) cbOk(resp);
                    }
                },
                cbErr);
        };
        var proto_getJoinedGroupListHigh = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;

            ConnManager.apiCall(SRV_NAME.GROUP, "get_joined_group_list", {
                    'Member_Account': options.Member_Account,
                    'Limit': options.Limit,
                    'Offset': options.Offset,
                    'GroupType': options.GroupType,
                    'ResponseFilter': {
                        'GroupBaseInfoFilter': options.GroupBaseInfoFilter,
                        'SelfInfoFilter': options.SelfInfoFilter
                    }
                },
                cbOk, cbErr);
        };

        //删除会话
        var proto_deleteChat = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;

            if (options.chatType == 1) {
                ConnManager.apiCall(SRV_NAME.DEL_CHAT, "delete", {
                        'From_Account': ctx.identifier,
                        'Type': options.chatType,
                        'To_Account': options.To_Account
                    },
                    cbOk, cbErr);
            } else {
                ConnManager.apiCall(SRV_NAME.DEL_CHAT, "delete", {
                        'From_Account': ctx.identifier,
                        'Type': options.chatType,
                        'ToGroupid': options.To_Account
                    },
                    cbOk, cbErr);

            }

        };

        //资料接口
        //查看个人资料
        var proto_getProfilePortrait = function(options, cbOk, cbErr) {
            if (options.To_Account.length > 100) {
                options.To_Account.length = 100;
                log.error('获取用户资料人数不能超过100人')
            }
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.PROFILE, "portrait_get", {
                    'From_Account': ctx.identifier,
                    'To_Account': options.To_Account,
                    //'LastStandardSequence':options.LastStandardSequence,
                    'TagList': options.TagList
                },
                function(resp) {
                    var errorAccount = [];
                    if (resp.Fail_Account && resp.Fail_Account.length) {
                        errorAccount = resp.Fail_Account;
                    }
                    if (resp.Invalid_Account && resp.Invalid_Account.length) {
                        for (var k in resp.Invalid_Account) {
                            errorAccount.push(resp.Invalid_Account[k]);
                        }
                    }
                    if (errorAccount.length) {
                        resp.ActionStatus = ACTION_STATUS.FAIL;
                        resp.ErrorCode = ERROR_CODE_CUSTOM;
                        resp.ErrorInfo = '';
                        for (var i in errorAccount) {
                            var failCount = errorAccount[i];
                            for (var j in resp.UserProfileItem) {
                                if (resp.UserProfileItem[j].To_Account == failCount) {
                                    var resultCode = resp.UserProfileItem[j].ResultCode;
                                    resp.UserProfileItem[j].ResultInfo = "[" + resultCode + "]" + resp.UserProfileItem[j].ResultInfo;
                                    resp.ErrorInfo += "账号:" + failCount + "," + resp.UserProfileItem[j].ResultInfo + "\n";
                                    break;
                                }
                            }
                        }
                    }
                    if (resp.ActionStatus == ACTION_STATUS.FAIL) {
                        if (cbErr) cbErr(resp);
                    } else if (cbOk) {
                        cbOk(resp);
                    }
                },
                cbErr);
        };

        //获取最近联系人
        var proto_getRecentContactList = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.RECENT_CONTACT, "get", {
                    'From_Account': ctx.identifier,
                    'Count': options.Count
                },
                cbOk, cbErr);
        };

        //上传图片或文件
        var proto_uploadPic = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            var cmdName;
            if (isAccessFormalEnv()) {
                cmdName = 'pic_up';
            } else {
                cmdName = 'pic_up_test';
            }
            ConnManager.apiCall(SRV_NAME.PIC, cmdName, {
                    'App_Version': VERSION_INFO.APP_VERSION,
                    'From_Account': ctx.identifier,
                    'To_Account': options.To_Account,
                    'Seq': options.Seq,
                    'Timestamp': options.Timestamp,
                    'Random': options.Random,
                    'File_Str_Md5': options.File_Str_Md5,
                    'File_Size': options.File_Size,
                    'File_Type': options.File_Type,
                    'Server_Ver': VERSION_INFO.SERVER_VERSION,
                    'Auth_Key': authkey,
                    'Busi_Id': options.Busi_Id,
                    'PkgFlag': options.PkgFlag,
                    'Slice_Offset': options.Slice_Offset,
                    'Slice_Size': options.Slice_Size,
                    'Slice_Data': options.Slice_Data
                },
                cbOk, cbErr);
        };

        //获取语音和文件下载IP和authkey
        var proto_getIpAndAuthkey = function(cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "authkey", {}, cbOk, cbErr);
        };

        var proto_getLongPollingId = function(options, cbOk, cbErr) {
            if (!checkLogin(cbErr, true)) return;
            ConnManager.apiCall(SRV_NAME.OPEN_IM, "getlongpollingid", {},
                function(resp) {
                    cbOk && cbOk(resp);
                }, cbErr);
        }


        var proto_applyDownload = function(options, cbOk, cbErr) {
            //把下载地址push到map中
            ConnManager.apiCall(SRV_NAME.PIC, "apply_download", options, cbOk, cbErr);
        }

        //end
        initBrowserInfo();
        // singleton object ConnManager
        var ConnManager = new function() {
                var onConnCallback = null; //回调函数
                this.init = function(onConnNotify, cbOk, cbErr) {
                    if (onConnNotify) onConnCallback = onConnNotify;
                };
                this.callBack = function(info) {
                    if (onConnCallback) onConnCallback(info);
                };
                this.clear = function() {
                    onConnCallback = null;
                };
                //请求后台服务接口
                this.apiCall = function(type, cmd, data, cbOk, cbErr, timeout, isLongPolling) {
                    //封装后台服务接口地址
                    var url = getApiUrl(type, cmd, cbOk, cbErr);
                    if (url == false) return;
                    //发起ajax请求
                    ajaxRequestJson("POST", url, data, timeout, isLongPolling, function(resp) {
                        var errorCode = null,
                            tempErrorInfo = '';
                        if (cmd == 'pic_up') {
                            data.Slice_Data = '';
                        }
                        var info = "\n request url: \n" + url + "\n request body: \n" + JSON.stringify(data) + "\n response: \n" + JSON.stringify(resp);
                        //成功
                        if (resp.ActionStatus == ACTION_STATUS.OK) {
                            log.info("[" + type + "][" + cmd + "]success: " + info);
                            if (cbOk) cbOk(resp); //回调
                            errorCode = 0;
                            tempErrorInfo = '';
                        } else {
                            errorCode = resp.ErrorCode;
                            tempErrorInfo = resp.ErrorInfo;
                            //报错
                            if (cbErr) {
                                resp.SrcErrorInfo = resp.ErrorInfo;
                                resp.ErrorInfo = "[" + type + "][" + cmd + "]failed: " + info;
                                if (cmd != 'longpolling' || resp.ErrorCode != longPollingTimeOutErrorCode) {
                                    log.error(resp.ErrorInfo);
                                }
                                cbErr(resp);
                            }
                        }
                    }, function(err) {
                        cbErr && cbErr(err);
                    });
                };
            };
        // class Session
        var Session = function(type, id, name, icon, time, seq) {
            this._impl = {
                skey: Session.skey(type, id),
                type: type,
                id: id,
                name: name,
                icon: icon,
                unread: 0, //未读消息数
                isAutoRead: false,
                time: time >= 0 ? time : 0,
                curMaxMsgSeq: seq >= 0 ? seq : 0,
                msgs: [],
                isFinished: 1
            };
        };
        Session.skey = function(type, id) {
            return type + id;
        };
        Session.prototype.type = function() {
            return this._impl.type;
        };
        Session.prototype.id = function() {
            return this._impl.id;
        };
        Session.prototype.name = function() {
            return this._impl.name;
        };
        Session.prototype.icon = function() {
            return this._impl.icon;
        };
        Session.prototype.unread = function(val) {
            if (typeof val !== 'undefined') {
                this._impl.unread = val;
            } else {
                return this._impl.unread;
            }
        };
        Session.prototype.isFinished = function(val) {
            if (typeof val !== 'undefined') {
                this._impl.isFinished = val;
            } else {
                return this._impl.isFinished;
            }
        };
        Session.prototype.time = function() {
            return this._impl.time;
        };
        Session.prototype.curMaxMsgSeq = function(seq) {
            if (typeof seq !== 'undefined') {
                this._impl.curMaxMsgSeq = seq;
            } else {
                return this._impl.curMaxMsgSeq;
            }
        };
        Session.prototype.msgCount = function() {
            return this._impl.msgs.length;
        };
        Session.prototype.msg = function(index) {
            return this._impl.msgs[index];
        };
        Session.prototype.msgs = function() {
            return this._impl.msgs;
        };
        Session.prototype._impl_addMsg = function(msg, unread) {
            this._impl.msgs.push(msg);
            //if (!msg.isSend && msg.time > this._impl.time)
            if (msg.time > this._impl.time)
                this._impl.time = msg.time;
            //if (!msg.isSend && msg.seq > this._impl.curMaxMsgSeq)
            if (msg.seq > this._impl.curMaxMsgSeq)
                this._impl.curMaxMsgSeq = msg.seq;
            //自己发送的消息不计入未读数
            if (!msg.isSend && !this._impl.isAutoRead && unread) {
                this._impl.unread++;
            }
        };
        //class C2CMsgReadedItem
        var C2CMsgReadedItem = function(toAccount, lastedMsgTime) {
            this.toAccount = toAccount;
            this.lastedMsgTime = lastedMsgTime;
        }


        // class Msg
        var Msg = function(sess, isSend, seq, random, time, fromAccount, subType, fromAccountNick, fromAccountHeadurl) {
            this.sess = sess;
            this.subType = subType >= 0 ? subType : 0; //消息类型,c2c消息时，type取值为0；group消息时，type取值0和1，0-普通群消息，1-群提示消息
            this.fromAccount = fromAccount;
            this.fromAccountNick = fromAccountNick ? fromAccountNick : fromAccount;
            this.fromAccountHeadurl = fromAccountHeadurl || null;
            this.isSend = Boolean(isSend);
            this.seq = seq >= 0 ? seq : nextSeq();
            this.random = random >= 0 ? random : createRandom();
            this.time = time >= 0 ? time : unixtime();
            this.elems = [];
            var type = sess.type();
            switch (type) {
                case SESSION_TYPE.GROUP:
                    break;
                case SESSION_TYPE.C2C:
                default:
                    break;
            }


        };
        Msg.prototype.getSession = function() {
            return this.sess;
        };
        Msg.prototype.getType = function() {
            return this.subType;
        };
        Msg.prototype.getSubType = function() {
            return this.subType;
        };
        Msg.prototype.getFromAccount = function() {
            return this.fromAccount;
        };
        Msg.prototype.getFromAccountNick = function() {
            return this.fromAccountNick;
        };
        Msg.prototype.getIsSend = function() {
            return this.isSend;
        };
        Msg.prototype.getSeq = function() {
            return this.seq;
        };
        Msg.prototype.getTime = function() {
            return this.time;
        };
        Msg.prototype.getRandom = function() {
            return this.random;
        };
        Msg.prototype.getElems = function() {
            return this.elems;
        };
        Msg.prototype.getMsgUniqueId = function() {
            return this.uniqueId;
        };
        //文本
        Msg.prototype.addText = function(text) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.TEXT, text));
        };
        //表情
        Msg.prototype.addFace = function(face) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.FACE, face));
        };
        //图片
        Msg.prototype.addImage = function(image) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.IMAGE, image));
        };
        //地理位置
        Msg.prototype.addLocation = function(location) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.LOCATION, location));
        };
        //文件
        Msg.prototype.addFile = function(file) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.FILE, file));
        };
        //自定义
        Msg.prototype.addCustom = function(custom) {
            this.addElem(new webim.Msg.Elem(MSG_ELEMENT_TYPE.CUSTOM, custom));
        };
        Msg.prototype.addElem = function(elem) {
            this.elems.push(elem);
        };
        Msg.prototype.toHtml = function() {
            var html = "";
            for (var i in this.elems) {
                var elem = this.elems[i];
                html += elem.toHtml();
            }
            return html;
        };

        // class Msg.Elem
        Msg.Elem = function(type, value) {
            this.type = type;
            this.content = value;
        };
        Msg.Elem.prototype.getType = function() {
            return this.type;
        };
        Msg.Elem.prototype.getContent = function() {
            return this.content;
        };
        Msg.Elem.prototype.toHtml = function() {
            var html;
            html = this.content.toHtml();
            return html;
        };

        // class Msg.Elem.Text
        Msg.Elem.Text = function(text) {
            this.text = tool.xssFilter(text);
        };
        Msg.Elem.Text.prototype.getText = function() {
            return this.text;
        };
        Msg.Elem.Text.prototype.toHtml = function() {
            return this.text;
        };

        // class Msg.Elem.Face
        Msg.Elem.Face = function(index, data) {
            this.index = index;
            this.data = data;
        };
        Msg.Elem.Face.prototype.getIndex = function() {
            return this.index;
        };
        Msg.Elem.Face.prototype.getData = function() {
            return this.data;
        };
        Msg.Elem.Face.prototype.toHtml = function() {
            var faceUrl = null;
            var index = emotionDataIndexs[this.data];
            var emotion = emotions[index];
            if (emotion && emotion[1]) {
                faceUrl = emotion[1];
            }
            if (faceUrl) {
                return "<img src='" + faceUrl + "'/>";
            } else {
                return this.data;
            }
        };

        // 地理位置消息 class Msg.Elem.Location
        Msg.Elem.Location = function(longitude, latitude, desc) {
            this.latitude = latitude; //纬度
            this.longitude = longitude; //经度
            this.desc = desc; //描述
        };
        Msg.Elem.Location.prototype.getLatitude = function() {
            return this.latitude;
        };
        Msg.Elem.Location.prototype.getLongitude = function() {
            return this.longitude;
        };
        Msg.Elem.Location.prototype.getDesc = function() {
            return this.desc;
        };
        Msg.Elem.Location.prototype.toHtml = function() {
            return '经度=' + this.longitude + ',纬度=' + this.latitude + ',描述=' + this.desc;
        };

        //图片消息
        // class Msg.Elem.Images
        Msg.Elem.Images = function(imageId, format) {
            this.UUID = imageId;
            if (typeof format !== 'number') {
                format = parseInt(IMAGE_FORMAT[format] || IMAGE_FORMAT['UNKNOWN'], 10);
            }
            this.ImageFormat = format;
            this.ImageInfoArray = [];
        };
        Msg.Elem.Images.prototype.addImage = function(image) {
            this.ImageInfoArray.push(image);
        };
        Msg.Elem.Images.prototype.toHtml = function() {
            var smallImage = this.getImage(IMAGE_TYPE.SMALL);
            var bigImage = this.getImage(IMAGE_TYPE.LARGE);
            var oriImage = this.getImage(IMAGE_TYPE.ORIGIN);
            if (!bigImage) {
                bigImage = smallImage;
            }
            if (!oriImage) {
                oriImage = smallImage;
            }
            return "<img src='" + smallImage.getUrl() + "#" + bigImage.getUrl() + "#" + oriImage.getUrl() + "' style='CURSOR: hand' id='" + this.getImageId() + "' bigImgUrl='" + bigImage.getUrl() + "' onclick='imageClick(this)' />";

        };
        Msg.Elem.Images.prototype.getImageId = function() {
            return this.UUID;
        };
        Msg.Elem.Images.prototype.getImageFormat = function() {
            return this.ImageFormat;
        };
        Msg.Elem.Images.prototype.getImage = function(type) {
            for (var i in this.ImageInfoArray) {
                if (this.ImageInfoArray[i].getType() == type) {
                    return this.ImageInfoArray[i];
                }
            }
            var img = null;
            this.ImageInfoArray.forEach(function(image) {
                if (image.getType() == type) {
                    img = image;
                }
            })
            return img;
        };
        // class Msg.Elem.Images.Image
        Msg.Elem.Images.Image = function(type, size, width, height, url) {
            this.type = type;
            this.size = size;
            this.width = width;
            this.height = height;
            this.url = url;
        };
        Msg.Elem.Images.Image.prototype.getType = function() {
            return this.type;
        };
        Msg.Elem.Images.Image.prototype.getSize = function() {
            return this.size;
        };
        Msg.Elem.Images.Image.prototype.getWidth = function() {
            return this.width;
        };
        Msg.Elem.Images.Image.prototype.getHeight = function() {
            return this.height;
        };
        Msg.Elem.Images.Image.prototype.getUrl = function() {
            return this.url;
        };

        // class Msg.Elem.Sound
        Msg.Elem.Sound = function(uuid, second, size, senderId, receiverId, downFlag, chatType) {
            this.uuid = uuid; //文件id
            this.second = second; //时长，单位：秒
            this.size = size; //大小，单位：字节
            this.senderId = senderId; //发送者
            this.receiverId = receiverId; //接收方id
            this.downFlag = downFlag; //下载标志位
            this.busiId = chatType == SESSION_TYPE.C2C ? 2 : 1; //busi_id ( 1：群    2:C2C)

            //根据不同情况拉取数据
            //是否需要申请下载地址  0:到架平申请  1:到cos申请  2:不需要申请, 直接拿url下载
            if (this.downFlag !== undefined && this.busiId !== undefined) {
                getFileDownUrlV2(uuid, senderId, second, downFlag, receiverId, this.busiId, UPLOAD_RES_TYPE.SOUND);
            } else {
                this.downUrl = getSoundDownUrl(uuid, senderId, second); //下载地址
            }
        };
        Msg.Elem.Sound.prototype.getUUID = function() {
            return this.uuid;
        };
        Msg.Elem.Sound.prototype.getSecond = function() {
            return this.second;
        };
        Msg.Elem.Sound.prototype.getSize = function() {
            return this.size;
        };
        Msg.Elem.Sound.prototype.getSenderId = function() {
            return this.senderId;
        };
        Msg.Elem.Sound.prototype.getDownUrl = function() {
            return this.downUrl;
        };
        Msg.Elem.Sound.prototype.toHtml = function() {
            if (BROWSER_INFO.type == 'ie' && parseInt(BROWSER_INFO.ver) <= 8) {
                return '[这是一条语音消息]demo暂不支持ie8(含)以下浏览器播放语音,语音URL:' + this.downUrl;
            }
            return '<audio id="uuid_' + this.uuid + '" src="' + this.downUrl + '" controls="controls" onplay="onChangePlayAudio(this)" preload="none"></audio>';
        };

        // class Msg.Elem.File
        Msg.Elem.File = function(uuid, name, size, senderId, receiverId, downFlag, chatType) {
            this.uuid = uuid; //文件id
            this.name = name; //文件名
            this.size = size; //大小，单位：字节
            this.senderId = senderId; //发送者
            this.receiverId = receiverId; //接收方id
            this.downFlag = downFlag; //下载标志位

            this.busiId = chatType == SESSION_TYPE.C2C ? 2 : 1; //busi_id ( 1：群    2:C2C)
            //根据不同情况拉取数据
            //是否需要申请下载地址  0:到架平申请  1:到cos申请  2:不需要申请, 直接拿url下载
            if (downFlag !== undefined && busiId !== undefined) {
                getFileDownUrlV2(uuid, senderId, name, downFlag, receiverId, this.busiId, UPLOAD_RES_TYPE.FILE);
            } else {
                this.downUrl = getFileDownUrl(uuid, senderId, name); //下载地址
            }
        };
        Msg.Elem.File.prototype.getUUID = function() {
            return this.uuid;
        };
        Msg.Elem.File.prototype.getName = function() {
            return this.name;
        };
        Msg.Elem.File.prototype.getSize = function() {
            return this.size;
        };
        Msg.Elem.File.prototype.getSenderId = function() {
            return this.senderId;
        };
        Msg.Elem.File.prototype.getDownUrl = function() {
            return this.downUrl;
        };
        Msg.Elem.File.prototype.getDownFlag = function() {
            return this.downFlag;
        };
        Msg.Elem.File.prototype.toHtml = function() {
            var fileSize, unitStr;
            fileSize = this.size;
            unitStr = "Byte";
            if (this.size >= 1024) {
                fileSize = Math.round(this.size / 1024);
                unitStr = "KB";
            }
            return {
                uuid: this.uuid,
                name: this.name,
                size: fileSize,
                unitStr: unitStr
            };
        };

        // 自定义消息类型 class Msg.Elem.Custom
        Msg.Elem.Custom = function(data, desc, ext) {
            this.data = data; //数据
            this.desc = desc; //描述
            this.ext = ext; //扩展字段
        };
        Msg.Elem.Custom.prototype.getData = function() {
            return this.data;
        };
        Msg.Elem.Custom.prototype.getDesc = function() {
            return this.desc;
        };
        Msg.Elem.Custom.prototype.getExt = function() {
            return this.ext;
        };
        Msg.Elem.Custom.prototype.toHtml = function() {
            return this.data;
        };

        // singleton object MsgStore
        var MsgStore = new function() {
                var sessMap = {}; //跟所有用户或群的聊天记录MAP
                var sessTimeline = []; //按时间降序排列的会话列表
                msgCache = {}; //消息缓存，用于判重
                //C2C
                this.cookie = ""; //上一次拉取新c2c消息的cookie
                this.syncFlag = 0; //上一次拉取新c2c消息的是否继续拉取标记

                var visitSess = function(visitor) {
                    for (var i in sessMap) {
                        visitor(sessMap[i]);
                    }
                };
                //消息查重
                var checkDupMsg = function(msg) {
                    var dup = false;
                    var first_key = msg.sess._impl.skey;
                    var second_key = msg.isSend + msg.seq + msg.random;
                    var tempMsg = msgCache[first_key] && msgCache[first_key][second_key];
                    if (tempMsg) {
                        dup = true;
                    }
                    if (msgCache[first_key]) {
                        msgCache[first_key][second_key] = {
                            time: msg.time
                        };
                    } else {
                        msgCache[first_key] = {};
                        msgCache[first_key][second_key] = {
                            time: msg.time
                        };
                    }
                    return dup;
                };

                this.sessMap = function() {
                    return sessMap;
                };
                this.sessCount = function() {
                    return sessTimeline.length;
                };
                this.sessByTypeId = function(type, id) {
                    var skey = Session.skey(type, id);
                    if (skey === undefined || skey == null) return null;
                    return sessMap[skey];
                };
                this.delSessByTypeId = function(type, id) {
                    var skey = Session.skey(type, id);
                    if (skey === undefined || skey == null) return false;
                    if (sessMap[skey]) {
                        delete sessMap[skey];
                        delete msgCache[skey];
                    }
                    return true;
                };
                this.resetCookieAndSyncFlag = function() {
                    this.cookie = "";
                    this.syncFlag = 0;
                };

                //切换将当前会话的自动读取消息标志为isOn,重置其他会话的自动读取消息标志为false
                this.setAutoRead = function(selSess, isOn, isResetAll) {
                    if (isResetAll)
                        visitSess(function(s) {
                            s._impl.isAutoRead = false;
                        });
                    if (selSess) {
                        selSess._impl.isAutoRead = isOn; //
                        if (isOn) { //是否调用已读上报接口
                            selSess._impl.unread = 0;

                            if (selSess._impl.type == SESSION_TYPE.C2C) { //私聊消息已读上报
                                var tmpC2CMsgReadedItem = [];
                                tmpC2CMsgReadedItem.push(new C2CMsgReadedItem(selSess._impl.id, selSess._impl.time));
                                //调用C2C消息已读上报接口
                                proto_c2CMsgReaded(MsgStore.cookie,
                                    tmpC2CMsgReadedItem,
                                    function(resp) {
                                        log.info("[setAutoRead]: c2CMsgReaded success");
                                    },
                                    function(err) {
                                        log.error("[setAutoRead}: c2CMsgReaded failed:" + err.ErrorInfo);
                                    });
                            } else if (selSess._impl.type == SESSION_TYPE.GROUP) { //群聊消息已读上报
                                var tmpOpt = {
                                    'GroupId': selSess._impl.id,
                                    'MsgReadedSeq': selSess._impl.curMaxMsgSeq
                                };
                                //调用group消息已读上报接口
                                proto_groupMsgReaded(tmpOpt,
                                    function(resp) {
                                        log.info("groupMsgReaded success");

                                    },
                                    function(err) {
                                        log.error("groupMsgReaded failed:" + err.ErrorInfo);

                                    });
                            }
                        }
                    }
                };

                this.c2CMsgReaded = function(opts, cbOk, cbErr) {
                    var tmpC2CMsgReadedItem = [];
                    tmpC2CMsgReadedItem.push(new C2CMsgReadedItem(opts.To_Account, opts.LastedMsgTime));
                    //调用C2C消息已读上报接口
                    proto_c2CMsgReaded(MsgStore.cookie,
                        tmpC2CMsgReadedItem,
                        function(resp) {
                            if (cbOk) {
                                log.info("c2CMsgReaded success");
                                cbOk(resp);
                            }
                        },
                        function(err) {
                            if (cbErr) {
                                log.error("c2CMsgReaded failed:" + err.ErrorInfo);
                                cbErr(err);
                            }
                        });
                };

                this.addSession = function(sess) {
                    sessMap[sess._impl.skey] = sess;
                };
                this.delSession = function(sess) {
                    delete sessMap[sess._impl.skey];
                };
                this.clear = function() {
                    sessMap = {}; //跟所有用户或群的聊天记录MAP
                    sessTimeline = []; //按时间降序排列的会话列表
                    msgCache = {}; //消息缓存，用于判重
                    this.cookie = ""; //上一次拉取新c2c消息的cookie
                    this.syncFlag = 0; //上一次拉取新c2c消息的是否继续拉取标记
                };
                this.addMsg = function(msg, unread) {
                    if (checkDupMsg(msg)) return false;
                    var sess = msg.sess;
                    if (!sessMap[sess._impl.skey]) this.addSession(sess);
                    sess._impl_addMsg(msg, unread);
                    return true;
                };
                this.updateTimeline = function() {
                    var arr = new Array;
                    visitSess(function(sess) {
                        arr.push(sess);
                    });
                    arr.sort(function(a, b) {
                        return b.time - a.time;
                    });
                    sessTimeline = arr;
                };
            };
        // singleton object MsgManager
        var MsgManager = new function() {

                var onMsgCallback = null; //新消息(c2c和group)回调

                var onGroupInfoChangeCallback = null; //群资料变化回调
                //收到新群系统消息回调列表
                var onGroupSystemNotifyCallbacks = {
                    "1": null,
                    "2": null,
                    "3": null,
                    "4": null,
                    "5": null,
                    "6": null,
                    "7": null,
                    "8": null,
                    "9": null,
                    "10": null,
                    "11": null,
                    "15": null,
                    "255": null,
                    "12": null,
                };
                //监听好友系统通知函数
                var onFriendSystemNotifyCallbacks = {
                    "1": null,
                    "2": null,
                    "3": null,
                    "4": null,
                    "5": null,
                    "6": null,
                    "7": null,
                    "8": null
                };

                var onProfileSystemNotifyCallbacks = {
                    "1": null
                };

                var onKickedEventCall = null;

                var onMsgReadCallback = null;

                //普通长轮询
                var longPollingOn = false; //是否开启普通长轮询
                var isLongPollingRequesting = false; //是否在长轮询ing
                var notifySeq = 0; //c2c通知seq
                var noticeSeq = 0; //群消息seq

                //大群长轮询
                var onBigGroupMsgCallback = null; //大群消息回调
                var bigGroupLongPollingOn = false; //是否开启长轮询
                var bigGroupLongPollingStartSeqMap = {}; //请求拉消息的起始seq(大群长轮询)
                var bigGroupLongPollingHoldTime = 90; //客户端长轮询的超时时间，单位是秒(大群长轮询)
                var bigGroupLongPollingKeyMap = null; //客户端加入群组后收到的的Key(大群长轮询)
                var bigGroupLongPollingMsgMap = {}; //记录收到的群消息数

                var onC2cEventCallbacks = {
                    "92": null, //消息已读通知,
                    "96": null
                };;
                var onAppliedDownloadUrl = null;


                var getLostGroupMsgCount = 0; //补拉丢失的群消息次数
                //我的群当前最大的seq
                var myGroupMaxSeqs = {}; //用于补拉丢失的群消息

                var groupSystemMsgsCache = {}; //群组系统消息缓存,用于判重

                //设置长轮询开关
                //isOn=true 开启
                //isOn=false 停止
                this.setLongPollingOn = function(isOn) {
                    longPollingOn = isOn;
                };
                this.getLongPollingOn = function() {
                    return longPollingOn;
                };

                //重置长轮询变量
                this.resetLongPollingInfo = function() {
                    longPollingOn = false;
                    notifySeq = 0;
                    noticeSeq = 0;
                };

                //设置大群长轮询开关
                //isOn=true 开启
                //isOn=false 停止
                this.setBigGroupLongPollingOn = function(isOn) {
                    bigGroupLongPollingOn = isOn;
                };

                //查看是否存在该轮询，防止多次入群
                this.checkBigGroupLongPollingOn = function(groupId) {
                    return !!bigGroupLongPollingKeyMap[groupId]
                };
                //设置大群长轮询key
                this.setBigGroupLongPollingKey = function(GroupId, key) {
                    bigGroupLongPollingKeyMap[GroupId] = key;
                };
                //重置大群长轮询变量
                this.resetBigGroupLongPollingInfo = function(groupId) {
                    bigGroupLongPollingOn = false;
                    bigGroupLongPollingStartSeqMap[groupId] = 0;
                    bigGroupLongPollingKeyMap[groupId] = null;
                    bigGroupLongPollingMsgMap[groupId] = {};

                };

                //设置群消息数据条数
                this.setBigGroupLongPollingMsgMap = function(groupId, count) {
                    var bigGroupLongPollingMsgCount = bigGroupLongPollingMsgMap[groupId];
                    if (bigGroupLongPollingMsgCount) {
                        bigGroupLongPollingMsgCount = parseInt(bigGroupLongPollingMsgCount) + count;
                        bigGroupLongPollingMsgMap[groupId] = bigGroupLongPollingMsgCount;
                    } else {
                        bigGroupLongPollingMsgMap[groupId] = count;
                    }
                };

                //重置
                this.clear = function() {

                    onGroupInfoChangeCallback = null;
                    onGroupSystemNotifyCallbacks = {
                        "1": null, //申请加群请求（只有管理员会收到）
                        "2": null, //申请加群被同意（只有申请人能够收到）
                        "3": null, //申请加群被拒绝（只有申请人能够收到）
                        "4": null, //被管理员踢出群(只有被踢者接收到)
                        "5": null, //群被解散(全员接收)
                        "6": null, //创建群(创建者接收)
                        "7": null, //邀请加群(被邀请者接收)
                        "8": null, //主动退群(主动退出者接收)
                        "9": null, //设置管理员(被设置者接收)
                        "10": null, //取消管理员(被取消者接收)
                        "11": null, //群已被回收(全员接收)
                        "15": null, //群已被回收(全员接收)
                        "255": null, //用户自定义通知(默认全员接收)
                        "12": null, //邀请加群(被邀请者需要同意)
                    };
                    onFriendSystemNotifyCallbacks = {
                        "1": null, //好友表增加
                        "2": null, //好友表删除
                        "3": null, //未决增加
                        "4": null, //未决删除
                        "5": null, //黑名单增加
                        "6": null, //黑名单删除
                        "7": null, //未决已读上报
                        "8": null //好友信息(备注，分组)变更
                    };
                    onProfileSystemNotifyCallbacks = {
                        "1": null //资料修改
                    };
                    //重置普通长轮询参数
                    onMsgCallback = null;
                    longPollingOn = false;
                    notifySeq = 0; //c2c新消息通知seq
                    noticeSeq = 0; //group新消息seq

                    //重置大群长轮询参数
                    onBigGroupMsgCallback = null;
                    bigGroupLongPollingOn = false;
                    bigGroupLongPollingStartSeqMap = {};
                    bigGroupLongPollingKeyMap = {};
                    bigGroupLongPollingMsgMap = {};

                    groupSystemMsgsCache = {};

                    ipList = []; //文件下载地址
                    authkey = null; //文件下载票据
                    expireTime = null; //票据超时时间
                };

                //初始化文件下载ip和票据
                var initIpAndAuthkey = function(cbOk, cbErr) {
                    proto_getIpAndAuthkey(function(resp) {
                            ipList = resp.IpList;
                            authkey = resp.AuthKey;
                            expireTime = resp.ExpireTime;
                            if (cbOk) cbOk(resp);
                        },
                        function(err) {
                            log.error("initIpAndAuthkey failed:" + err.ErrorInfo);
                            if (cbErr) cbErr(err);
                        }
                    );
                };

                //初始化我的群当前最大的seq，用于补拉丢失的群消息
                var initMyGroupMaxSeqs = function(cbOk, cbErr) {
                    var opts = {
                        'Member_Account': ctx.identifier,
                        'Limit': 1000,
                        'Offset': 0,
                        'GroupBaseInfoFilter': [
                            'NextMsgSeq'
                        ]
                    };
                    proto_getJoinedGroupListHigh(opts, function(resp) {
                            if (!resp.GroupIdList || resp.GroupIdList.length == 0) {
                                log.info("initMyGroupMaxSeqs: 目前还没有加入任何群组");
                                if (cbOk) cbOk(resp);
                                return;
                            }
                            for (var i = 0; i < resp.GroupIdList.length; i++) {
                                var group_id = resp.GroupIdList[i].GroupId;
                                var curMaxSeq = resp.GroupIdList[i].NextMsgSeq - 1;
                                myGroupMaxSeqs[group_id] = curMaxSeq;
                            }

                            if (cbOk) cbOk(resp);

                        },
                        function(err) {
                            log.error("initMyGroupMaxSeqs failed:" + err.ErrorInfo);
                            if (cbErr) cbErr(err);
                        }
                    );
                };

                //处理C2C EVENT 消息通道Array
                var handlerC2cNotifyMsgArray = function(arr) {
                    for (var i = 0, l = arr.length; i < l; i++) {
                        handlerC2cEventMsg(arr[i]);
                    }
                }

                //处理C2C EVENT 消息通道Item
                var handlerC2cEventMsg = function(notify) {
                    var subType = notify.SubMsgType;
                    switch (subType) {
                        case C2C_EVENT_SUB_TYPE.READED:
                            log.warn("C2C已读消息通知");
                            if (notify.ReadC2cMsgNotify && notify.ReadC2cMsgNotify.UinPairReadArray && onC2cEventCallbacks[subType]) {
                                for (var i = 0, l = notify.ReadC2cMsgNotify.UinPairReadArray.length; i < l; i++) {
                                    var item = notify.ReadC2cMsgNotify.UinPairReadArray[i];
                                    onC2cEventCallbacks[subType](item);
                                }
                            }
                            break;
                        case C2C_EVENT_SUB_TYPE.KICKEDOUT:
                            log.warn("多终端互踢通知");
                            proto_logout('instance');
                            if (onC2cEventCallbacks[subType]) {
                                onC2cEventCallbacks[subType]();
                            }
                            break;
                        default:
                            log.error("未知C2c系统消息：subType=" + subType);
                            break;
                    }

                };

                //长轮询
                this.longPolling = function(cbOk, cbErr) {


                    var opts = {
                        'Timeout': longPollingDefaultTimeOut / 1000,
                        'Cookie': {
                            'NotifySeq': notifySeq,
                            'NoticeSeq': noticeSeq
                        }
                    };
                    if (LongPollingId) {
                        opts.Cookie.LongPollingId = LongPollingId;
                        doPolling();
                    } else {
                        proto_getLongPollingId({}, function(resp) {
                            LongPollingId = opts.Cookie.LongPollingId = resp.LongPollingId;
                            //根据回包设置超时时间，超时时长不能>60秒，因为webkit手机端的最长超时时间不能大于60s
                            longPollingDefaultTimeOut = resp.Timeout > 60 ? longPollingDefaultTimeOut : resp.Timeout * 1000;
                            doPolling();
                        });
                    }

                    function doPolling() {
                        proto_longPolling(opts, function(resp) {
                            for (var i in resp.EventArray) {
                                var e = resp.EventArray[i];
                                switch (e.Event) {
                                    case LONG_POLLINNG_EVENT_TYPE.C2C: //c2c消息通知
                                        //更新C2C消息通知seq
                                        notifySeq = e.NotifySeq;
                                        log.warn("longpolling: received new c2c msg");
                                        //获取新消息
                                        MsgManager.syncMsgs();
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.GROUP_COMMON: //普通群消息通知
                                        log.warn("longpolling: received new group msgs");
                                        handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupMsgArray);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP: //（全员广播）群提示消息
                                        log.warn("longpolling: received new group tips");
                                        handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupTips);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.GROUP_TIP2: //群提示消息
                                        log.warn("longpolling: received new group tips");
                                        handlerOrdinaryAndTipGroupMsgs(e.Event, e.GroupTips);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.GROUP_SYSTEM: //（多终端同步）群系统消息
                                        log.warn("longpolling: received new group system msgs");
                                        //false 表示 通过长轮询收到的群系统消息，可以不判重
                                        handlerGroupSystemMsgs(e.GroupTips, false);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.FRIEND_NOTICE: //好友系统通知
                                        log.warn("longpolling: received new friend system notice");
                                        //false 表示 通过长轮询收到的好友系统通知，可以不判重
                                        handlerFriendSystemNotices(e.FriendListMod, false);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.PROFILE_NOTICE: //资料系统通知
                                        log.warn("longpolling: received new profile system notice");
                                        //false 表示 通过长轮询收到的资料系统通知，可以不判重
                                        handlerProfileSystemNotices(e.ProfileDataMod, false);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.C2C_COMMON: //c2c消息通知
                                        noticeSeq = e.C2cMsgArray[0].NoticeSeq;
                                        //更新C2C消息通知seq
                                        log.warn("longpolling: received new c2c_common msg", noticeSeq);
                                        handlerOrdinaryAndTipC2cMsgs(e.Event, e.C2cMsgArray);
                                        break;
                                    case LONG_POLLINNG_EVENT_TYPE.C2C_EVENT: //c2c已读消息通知
                                        noticeSeq = e.C2cNotifyMsgArray[0].NoticeSeq;
                                        log.warn("longpolling: received new c2c_event msg");
                                        handlerC2cNotifyMsgArray(e.C2cNotifyMsgArray);
                                        break;
                                    default:
                                        log.error("longpolling收到未知新消息类型: Event=" + e.Event);
                                        break;
                                }
                            }
                            var successInfo = {
                                'ActionStatus': ACTION_STATUS.OK,
                                'ErrorCode': 0
                            };
                            updatecLongPollingStatus(successInfo);
                        }, function(err) {
                            //log.error(err);
                            updatecLongPollingStatus(err);
                            if (cbErr) cbErr(err);
                        });
                    }
                };

                //更新连接状态
                var updatecLongPollingStatus = function(errObj) {
                    if (errObj.ErrorCode == 0 || errObj.ErrorCode == longPollingTimeOutErrorCode) {
                        curLongPollingRetErrorCount = 0;
                        longPollingOffCallbackFlag = false;
                        var errorInfo;
                        var isNeedCallback = false;
                        switch (curLongPollingStatus) {
                            case CONNECTION_STATUS.INIT:
                                isNeedCallback = true;
                                curLongPollingStatus = CONNECTION_STATUS.ON;
                                errorInfo = "create connection successfully(INIT->ON)";
                                break;
                            case CONNECTION_STATUS.ON:
                                errorInfo = "connection is on...(ON->ON)";
                                break;
                            case CONNECTION_STATUS.RECONNECT:
                                curLongPollingStatus = CONNECTION_STATUS.ON;
                                errorInfo = "connection is on...(RECONNECT->ON)";
                                break;
                            case CONNECTION_STATUS.OFF:
                                isNeedCallback = true;
                                curLongPollingStatus = CONNECTION_STATUS.RECONNECT;
                                errorInfo = "reconnect successfully(OFF->RECONNECT)";
                                break;
                        }
                        var successInfo = {
                            'ActionStatus': ACTION_STATUS.OK,
                            'ErrorCode': curLongPollingStatus,
                            'ErrorInfo': errorInfo
                        };
                        isNeedCallback && ConnManager.callBack(successInfo);
                        longPollingOn && MsgManager.longPolling();
                    } else if (errObj.ErrorCode == longPollingKickedErrorCode) {
                        //登出
                        log.error("多实例登录，被kick");
                        if (onKickedEventCall) {
                            onKickedEventCall();
                        }
                    } else {
                        //记录长轮询返回解析json错误次数
                        curLongPollingRetErrorCount++;
                        log.warn("longPolling接口第" + curLongPollingRetErrorCount + "次报错: " + errObj.ErrorInfo);
                        //累计超过一定次数
                        if (curLongPollingRetErrorCount <= LONG_POLLING_MAX_RET_ERROR_COUNT) {
                            setTimeout(startNextLongPolling, 100); //
                        } else {
                            curLongPollingStatus = CONNECTION_STATUS.OFF;
                            var errInfo = {
                                'ActionStatus': ACTION_STATUS.FAIL,
                                'ErrorCode': CONNECTION_STATUS.OFF,
                                'ErrorInfo': 'connection is off'
                            };
                            longPollingOffCallbackFlag == false && ConnManager.callBack(errInfo);
                            longPollingOffCallbackFlag = true;
                            log.warn(longPollingIntervalTime + "毫秒之后,SDK会发起新的longPolling请求...");
                            setTimeout(startNextLongPolling, longPollingIntervalTime); //长轮询接口报错次数达到一定值，每间隔5s发起新的长轮询
                        }
                    }
                };

                //处理收到的普通C2C消息
                var handlerOrdinaryAndTipC2cMsgs = function(eventType, C2cMsgArray) {
                    //处理c2c消息
                    var notifyInfo = [];
                    var msgInfos = [];
                    msgInfos = C2cMsgArray; //返回的消息列表
                    // MsgStore.cookie = resp.Cookie;//cookies，记录当前读到的最新消息位置

                    for (var i in msgInfos) {
                        var msgInfo = msgInfos[i];
                        var isSendMsg, id;
                        var headUrl = msgInfo.From_AccountHeadurl || '';
                        if (msgInfo.From_Account == ctx.identifier) { //当前用户发送的消息
                            isSendMsg = true;
                            id = msgInfo.To_Account; //读取接收者信息
                        } else { //当前用户收到的消息
                            isSendMsg = false;
                            id = msgInfo.From_Account; //读取发送者信息
                        }
                        var sess = MsgStore.sessByTypeId(SESSION_TYPE.C2C, id);
                        if (!sess) {
                            sess = new Session(SESSION_TYPE.C2C, id, id, headUrl, 0, 0);
                        }
                        var msg = new Msg(sess, isSendMsg, msgInfo.MsgSeq, msgInfo.MsgRandom, msgInfo.MsgTimeStamp, msgInfo.From_Account, C2C_MSG_SUB_TYPE.COMMON, msgInfo.From_AccountNick, headUrl);
                        var msgBody = null;
                        var msgContent = null;
                        var msgType = null;
                        for (var mi in msgInfo.MsgBody) {
                            msgBody = msgInfo.MsgBody[mi];
                            msgType = msgBody.MsgType;
                            switch (msgType) {
                                case MSG_ELEMENT_TYPE.TEXT:
                                    msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text);
                                    break;
                                case MSG_ELEMENT_TYPE.FACE:
                                    msgContent = new Msg.Elem.Face(
                                        msgBody.MsgContent.Index,
                                        msgBody.MsgContent.Data
                                    );
                                    break;
                                case MSG_ELEMENT_TYPE.IMAGE:
                                    msgContent = new Msg.Elem.Images(
                                        msgBody.MsgContent.UUID,
                                        msgBody.MsgContent.ImageFormat || ""
                                    );
                                    for (var j in msgBody.MsgContent.ImageInfoArray) {
                                        var tempImg = msgBody.MsgContent.ImageInfoArray[j];
                                        msgContent.addImage(
                                            new Msg.Elem.Images.Image(
                                                tempImg.Type,
                                                tempImg.Size,
                                                tempImg.Width,
                                                tempImg.Height,
                                                tempImg.URL
                                            )
                                        );
                                    }
                                    break;
                                case MSG_ELEMENT_TYPE.SOUND:
                                    if (msgBody.MsgContent) {
                                        msgContent = new Msg.Elem.Sound(
                                            msgBody.MsgContent.UUID,
                                            msgBody.MsgContent.Second,
                                            msgBody.MsgContent.Size,
                                            msgInfo.From_Account,
                                            msgInfo.To_Account,
                                            msgBody.MsgContent.Download_Flag,
                                            SESSION_TYPE.C2C
                                        );
                                    } else {
                                        msgType = MSG_ELEMENT_TYPE.TEXT;
                                        msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错');
                                    }
                                    break;
                                case MSG_ELEMENT_TYPE.LOCATION:
                                    msgContent = new Msg.Elem.Location(
                                        msgBody.MsgContent.Longitude,
                                        msgBody.MsgContent.Latitude,
                                        msgBody.MsgContent.Desc
                                    );
                                    break;
                                case MSG_ELEMENT_TYPE.FILE:
                                case MSG_ELEMENT_TYPE.FILE + " ":
                                    msgType = MSG_ELEMENT_TYPE.FILE;
                                    if (msgBody.MsgContent) {
                                        msgContent = new Msg.Elem.File(
                                            msgBody.MsgContent.UUID,
                                            msgBody.MsgContent.FileName,
                                            msgBody.MsgContent.FileSize,
                                            msgInfo.From_Account,
                                            msgInfo.To_Account,
                                            msgBody.MsgContent.Download_Flag,
                                            SESSION_TYPE.C2C
                                        );
                                    } else {
                                        msgType = MSG_ELEMENT_TYPE.TEXT;
                                        msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]');
                                    }
                                    break;
                                case MSG_ELEMENT_TYPE.CUSTOM:
                                    try {
                                        var data = JSON.parse(msgBody.MsgContent.Data);
                                        if (data && data.userAction && data.userAction == FRIEND_WRITE_MSG_ACTION.ING) { //过滤安卓或ios的正在输入自定义消息
                                            continue;
                                        }
                                    } catch (e) {}

                                    msgType = MSG_ELEMENT_TYPE.CUSTOM;
                                    msgContent = new Msg.Elem.Custom(
                                        msgBody.MsgContent.Data,
                                        msgBody.MsgContent.Desc,
                                        msgBody.MsgContent.Ext
                                    );
                                    break;
                                default:
                                    msgType = MSG_ELEMENT_TYPE.TEXT;
                                    msgContent = new Msg.Elem.Text('web端暂不支持' + msgBody.MsgType + '消息');
                                    break;
                            }
                            msg.elems.push(new Msg.Elem(msgType, msgContent));
                        }

                        if (msg.elems.length > 0 && MsgStore.addMsg(msg, true)) {
                            notifyInfo.push(msg);
                        }
                    } // for loop
                    if (notifyInfo.length > 0)
                        MsgStore.updateTimeline();
                    if (notifyInfo.length > 0) {
                        if (onMsgCallback) onMsgCallback(notifyInfo);
                    }
                };

                //发起新的长轮询请求
                var startNextLongPolling = function() {
                    longPollingOn && MsgManager.longPolling();
                };

                //拉取c2c消息(包含加群未决消息，需要处理)
                this.syncMsgs = function(cbOk, cbErr) {
                    var notifyInfo = [];
                    var msgInfos = [];
                    //读取C2C消息
                    proto_getMsgs(MsgStore.cookie, MsgStore.syncFlag, function(resp) {
                        //拉取完毕
                        if (resp.SyncFlag == 2) {
                            MsgStore.syncFlag = 0;
                        }
                        //处理c2c消息
                        msgInfos = resp.MsgList; //返回的消息列表
                        MsgStore.cookie = resp.Cookie; //cookies，记录当前读到的最新消息位置

                        for (var i in msgInfos) {
                            var msgInfo = msgInfos[i];
                            var isSendMsg, id, headUrl;
                            if (msgInfo.From_Account == ctx.identifier) { //当前用户发送的消息
                                isSendMsg = true;
                                id = msgInfo.To_Account; //读取接收者信息
                                headUrl = '';
                            } else { //当前用户收到的消息
                                isSendMsg = false;
                                id = msgInfo.From_Account; //读取发送者信息
                                headUrl = '';
                            }
                            var sess = MsgStore.sessByTypeId(SESSION_TYPE.C2C, id);
                            if (!sess) {
                                sess = new Session(SESSION_TYPE.C2C, id, id, headUrl, 0, 0);
                            }
                            var msg = new Msg(sess, isSendMsg, msgInfo.MsgSeq, msgInfo.MsgRandom, msgInfo.MsgTimeStamp, msgInfo.From_Account, C2C_MSG_SUB_TYPE.COMMON, msgInfo.From_AccountNick, msgInfo.From_AccountHeadurl);
                            var msgBody = null;
                            var msgContent = null;
                            var msgType = null;
                            for (var mi in msgInfo.MsgBody) {
                                msgBody = msgInfo.MsgBody[mi];
                                msgType = msgBody.MsgType;
                                switch (msgType) {
                                    case MSG_ELEMENT_TYPE.TEXT:
                                        msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text);
                                        break;
                                    case MSG_ELEMENT_TYPE.FACE:
                                        msgContent = new Msg.Elem.Face(
                                            msgBody.MsgContent.Index,
                                            msgBody.MsgContent.Data
                                        );
                                        break;
                                    case MSG_ELEMENT_TYPE.IMAGE:
                                        msgContent = new Msg.Elem.Images(
                                            msgBody.MsgContent.UUID,
                                            msgBody.MsgContent.ImageFormat
                                        );
                                        for (var j in msgBody.MsgContent.ImageInfoArray) {
                                            var tempImg = msgBody.MsgContent.ImageInfoArray[j];
                                            msgContent.addImage(
                                                new Msg.Elem.Images.Image(
                                                    tempImg.Type,
                                                    tempImg.Size,
                                                    tempImg.Width,
                                                    tempImg.Height,
                                                    tempImg.URL
                                                )
                                            );
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.SOUND:
                                        // var soundUrl = getSoundDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account);
                                        if (msgBody.MsgContent) {
                                            msgContent = new Msg.Elem.Sound(
                                                msgBody.MsgContent.UUID,
                                                msgBody.MsgContent.Second,
                                                msgBody.MsgContent.Size,
                                                msgInfo.From_Account,
                                                msgInfo.To_Account,
                                                msgBody.MsgContent.Download_Flag,
                                                SESSION_TYPE.C2C
                                            );
                                        } else {
                                            msgType = MSG_ELEMENT_TYPE.TEXT;
                                            msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错');
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.LOCATION:
                                        msgContent = new Msg.Elem.Location(
                                            msgBody.MsgContent.Longitude,
                                            msgBody.MsgContent.Latitude,
                                            msgBody.MsgContent.Desc
                                        );
                                        break;
                                    case MSG_ELEMENT_TYPE.FILE:
                                    case MSG_ELEMENT_TYPE.FILE + " ":
                                        msgType = MSG_ELEMENT_TYPE.FILE;
                                        // var fileUrl = getFileDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account, msgBody.MsgContent.FileName);
                                        if (msgBody.MsgContent) {
                                            msgContent = new Msg.Elem.File(
                                                msgBody.MsgContent.UUID,
                                                msgBody.MsgContent.FileName,
                                                msgBody.MsgContent.FileSize,
                                                msgInfo.From_Account,
                                                msgInfo.To_Account,
                                                msgBody.MsgContent.Download_Flag,
                                                SESSION_TYPE.C2C
                                            );
                                        } else {
                                            msgType = MSG_ELEMENT_TYPE.TEXT;
                                            msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]');
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.CUSTOM:
                                        try {
                                            var data = JSON.parse(msgBody.MsgContent.Data);
                                            if (data && data.userAction && data.userAction == FRIEND_WRITE_MSG_ACTION.ING) { //过滤安卓或ios的正在输入自定义消息
                                                continue;
                                            }
                                        } catch (e) {}

                                        msgType = MSG_ELEMENT_TYPE.CUSTOM;
                                        msgContent = new Msg.Elem.Custom(
                                            msgBody.MsgContent.Data,
                                            msgBody.MsgContent.Desc,
                                            msgBody.MsgContent.Ext
                                        );
                                        break;
                                    default:
                                        msgType = MSG_ELEMENT_TYPE.TEXT;
                                        msgContent = new Msg.Elem.Text('web端暂不支持' + msgBody.MsgType + '消息');
                                        break;
                                }
                                msg.elems.push(new Msg.Elem(msgType, msgContent));
                            }

                            if (msg.elems.length > 0 && MsgStore.addMsg(msg, true)) {
                                notifyInfo.push(msg);
                            }
                        } // for loop

                        //处理加群未决申请消息
                        handlerApplyJoinGroupSystemMsgs(resp.EventArray);

                        if (notifyInfo.length > 0)
                            MsgStore.updateTimeline();
                        if (cbOk) cbOk(notifyInfo);
                        else if (notifyInfo.length > 0) {
                            if (onMsgCallback) onMsgCallback(notifyInfo);
                        }

                    }, function(err) {
                        log.error("getMsgs failed:" + err.ErrorInfo);
                        if (cbErr) cbErr(err);
                    });
                };


                //拉取C2C漫游消息
                this.getC2CHistoryMsgs = function(options, cbOk, cbErr) {

                    if (!options.Peer_Account) {
                        if (cbErr) {
                            cbErr(tool.getReturnError("Peer_Account is empty", -13));
                            return;
                        }
                    }
                    if (!options.MaxCnt) {
                        options.MaxCnt = 15;
                    }
                    if (options.MaxCnt <= 0) {
                        if (cbErr) {
                            cbErr(tool.getReturnError("MaxCnt should be greater than 0", -14));
                            return;
                        }
                    }
                    if (options.MaxCnt > 15) {
                        if (cbErr) {
                            cbErr(tool.getReturnError("MaxCnt can not be greater than 15", -15));
                            return;
                        }
                        return;
                    }
                    if (options.MsgKey == null || options.MsgKey === undefined) {
                        options.MsgKey = '';
                    }
                    var opts = {
                        'Peer_Account': options.Peer_Account,
                        'MaxCnt': options.MaxCnt,
                        'LastMsgTime': options.LastMsgTime,
                        'MsgKey': options.MsgKey
                    };
                    //读取c2c漫游消息
                    proto_getC2CHistoryMsgs(opts, function(resp) {
                        var msgObjList = [];
                        var msgInfos = [];
                        //处理c2c消息
                        msgInfos = resp.MsgList; //返回的消息列表
                        var sess = MsgStore.sessByTypeId(SESSION_TYPE.C2C, options.Peer_Account);
                        if (!sess) {
                            sess = new Session(SESSION_TYPE.C2C, options.Peer_Account, options.Peer_Account, '', 0, 0);
                        }
                        for (var i in msgInfos) {
                            var msgInfo = msgInfos[i];
                            var isSendMsg, id;
                            var headUrl = msgInfo.From_AccountHeadurl || '';
                            if (msgInfo.From_Account == ctx.identifier) { //当前用户发送的消息
                                isSendMsg = true;
                                id = msgInfo.To_Account; //读取接收者信息
                            } else { //当前用户收到的消息
                                isSendMsg = false;
                                id = msgInfo.From_Account; //读取发送者信息
                            }
                            var msg = new Msg(sess, isSendMsg, msgInfo.MsgSeq, msgInfo.MsgRandom, msgInfo.MsgTimeStamp, msgInfo.From_Account, C2C_MSG_SUB_TYPE.COMMON, msgInfo.From_AccountNick, headUrl);
                            var msgBody = null;
                            var msgContent = null;
                            var msgType = null;
                            for (var mi in msgInfo.MsgBody) {
                                msgBody = msgInfo.MsgBody[mi];
                                msgType = msgBody.MsgType;
                                switch (msgType) {
                                    case MSG_ELEMENT_TYPE.TEXT:
                                        msgContent = new Msg.Elem.Text(msgBody.MsgContent.Text);
                                        break;
                                    case MSG_ELEMENT_TYPE.FACE:
                                        msgContent = new Msg.Elem.Face(
                                            msgBody.MsgContent.Index,
                                            msgBody.MsgContent.Data
                                        );
                                        break;
                                    case MSG_ELEMENT_TYPE.IMAGE:
                                        msgContent = new Msg.Elem.Images(
                                            msgBody.MsgContent.UUID,
                                            msgBody.MsgContent.ImageFormat
                                        );
                                        for (var j in msgBody.MsgContent.ImageInfoArray) {
                                            var tempImg = msgBody.MsgContent.ImageInfoArray[j];
                                            msgContent.addImage(
                                                new Msg.Elem.Images.Image(
                                                    tempImg.Type,
                                                    tempImg.Size,
                                                    tempImg.Width,
                                                    tempImg.Height,
                                                    tempImg.URL
                                                )
                                            );
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.SOUND:

                                        // var soundUrl = getSoundDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account);

                                        if (msgBody.MsgContent) {
                                            msgContent = new Msg.Elem.Sound(
                                                msgBody.MsgContent.UUID,
                                                msgBody.MsgContent.Second,
                                                msgBody.MsgContent.Size,
                                                msgInfo.From_Account,
                                                msgInfo.To_Account,
                                                msgBody.MsgContent.Download_Flag,
                                                SESSION_TYPE.C2C
                                            );
                                        } else {
                                            msgType = MSG_ELEMENT_TYPE.TEXT;
                                            msgContent = new Msg.Elem.Text('[语音消息]下载地址解析出错');
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.LOCATION:
                                        msgContent = new Msg.Elem.Location(
                                            msgBody.MsgContent.Longitude,
                                            msgBody.MsgContent.Latitude,
                                            msgBody.MsgContent.Desc
                                        );
                                        break;
                                    case MSG_ELEMENT_TYPE.FILE:
                                    case MSG_ELEMENT_TYPE.FILE + " ":
                                        msgType = MSG_ELEMENT_TYPE.FILE;
                                        // var fileUrl = getFileDownUrl(msgBody.MsgContent.UUID, msgInfo.From_Account, msgBody.MsgContent.FileName);

                                        if (msgBody.MsgContent) {
                                            msgContent = new Msg.Elem.File(
                                                msgBody.MsgContent.UUID,
                                                msgBody.MsgContent.FileName,
                                                msgBody.MsgContent.FileSize,
                                                msgInfo.From_Account,
                                                msgInfo.To_Account,
                                                msgBody.MsgContent.Download_Flag,
                                                SESSION_TYPE.C2C
                                            );
                                        } else {
                                            msgType = MSG_ELEMENT_TYPE.TEXT;
                                            msgContent = new Msg.Elem.Text('[文件消息下载地址解析出错]');
                                        }
                                        break;
                                    case MSG_ELEMENT_TYPE.CUSTOM:
                                        msgType = MSG_ELEMENT_TYPE.CUSTOM;
                                        msgContent = new Msg.Elem.Custom(
                                            msgBody.MsgContent.Data,
                                            msgBody.MsgContent.Desc,
                                            msgBody.MsgContent.Ext
                                        );

                                        break;
                                    default:
                                        msgType = MSG_ELEMENT_TYPE.TEXT;
                                        msgContent = new Msg.Elem.Text('web端暂不支持' + msgBody.MsgType + '消息');
                                        break;
                                }
                                msg.elems.push(new Msg.Elem(msgType, msgContent));
                            }
                            MsgStore.addMsg(msg);
                            msgObjList.push(msg);
                        } // for loop

                        MsgStore.updateTimeline();
                        if (cbOk) {

                            var newResp = {
                                'Complete': resp.Complete,
                                'MsgCount': msgObjList.length,
                                'LastMsgTime': resp.LastMsgTime,
                                'MsgKey': resp.MsgKey,
                                'MsgList': msgObjList
                            };
                            sess.isFinished(resp.Complete);
                            cbOk(newResp);
                        }

                    }, function(err) {
                        log.error("getC2CHistoryMsgs failed:" + err.ErrorInfo);
                        if (cbErr) cbErr(err);
                    });
                };

                //初始化
                this.init = function(listeners, cbOk, cbErr) {
                    if (!listeners.onMsgNotify) {
                        log.warn('listeners.onMsgNotify is empty');
                    }
                    onMsgCallback = listeners.onMsgNotify;

                    if (listeners.onBigGroupMsgNotify) {
                        onBigGroupMsgCallback = listeners.onBigGroupMsgNotify;
                    } else {
                        log.warn('listeners.onBigGroupMsgNotify is empty');
                    }

                    if (listeners.onC2cEventNotifys) {
                        onC2cEventCallbacks = listeners.onC2cEventNotifys;
                    } else {
                        log.warn('listeners.onC2cEventNotifys is empty');
                    }
                    if (listeners.onGroupSystemNotifys) {
                        onGroupSystemNotifyCallbacks = listeners.onGroupSystemNotifys;
                    } else {
                        log.warn('listeners.onGroupSystemNotifys is empty');
                    }
                    if (listeners.onGroupInfoChangeNotify) {
                        onGroupInfoChangeCallback = listeners.onGroupInfoChangeNotify;
                    } else {
                        log.warn('listeners.onGroupInfoChangeNotify is empty');
                    }
                    if (listeners.onFriendSystemNotifys) {
                        onFriendSystemNotifyCallbacks = listeners.onFriendSystemNotifys;
                    } else {
                        log.warn('listeners.onFriendSystemNotifys is empty');
                    }
                    if (listeners.onProfileSystemNotifys) {
                        onProfileSystemNotifyCallbacks = listeners.onProfileSystemNotifys;
                    } else {
                        log.warn('listeners.onProfileSystemNotifys is empty');
                    }
                    if (listeners.onKickedEventCall) {
                        onKickedEventCall = listeners.onKickedEventCall;
                    } else {
                        log.warn('listeners.onKickedEventCall is empty');
                    }
                    if (listeners.onLongPullingNotify) {
                        onLongPullingNotify = listeners.onLongPullingNotify;
                    } else {
                        log.warn('listeners.onKickedEventCall is empty');
                    }

                    if (listeners.onAppliedDownloadUrl) {
                        onAppliedDownloadUrl = listeners.onAppliedDownloadUrl;
                    } else {
                        log.warn('listeners.onAppliedDownloadUrl is empty');
                    }

                    if (!ctx.identifier || !ctx.userSig) {
                        if (cbOk) {
                            var success = {
                                'ActionStatus': ACTION_STATUS.OK,
                                'ErrorCode': 0,
                                'ErrorInfo': "login success(no login state)"
                            };
                            cbOk(success);
                        }
                        return;
                    }

                    //初始化
                    initMyGroupMaxSeqs(
                        function(resp) {
                            log.info('initMyGroupMaxSeqs success');
                            //初始化文件
                            initIpAndAuthkey(
                                function(initIpAndAuthkeyResp) {
                                    log.info('initIpAndAuthkey success');
                                    if (cbOk) {
                                        log.info('login success(have login state))');
                                        var success = {
                                            'ActionStatus': ACTION_STATUS.OK,
                                            'ErrorCode': 0,
                                            'ErrorInfo': "login success"
                                        };
                                        cbOk(success);
                                    }
                                    MsgManager.setLongPollingOn(true); //开启长轮询
                                    longPollingOn && MsgManager.longPolling(cbOk);
                                }, cbErr);
                        }, cbErr);
                };

                //发消息（私聊或群聊）
                this.sendMsg = function(msg, cbOk, cbErr) {
                    proto_sendMsg(msg, function(resp) {
                        //私聊时，加入自己的发的消息，群聊时，由于seq和服务器的seq不一样，所以不作处理
                        if (msg.sess.type() == SESSION_TYPE.C2C) {
                            if (!MsgStore.addMsg(msg)) {
                                var errInfo = "sendMsg: addMsg failed!";
                                var error = tool.getReturnError(errInfo, -17);
                                log.error(errInfo);
                                if (cbErr) cbErr(error);
                                return;
                            }
                            //更新信息流时间
                            MsgStore.updateTimeline();
                        }
                        if (cbOk) cbOk(resp);
                    }, function(err) {
                        if (cbErr) cbErr(err);
                    });
                };
            };

        //web im 基础对象

        //常量对象

        //会话类型
        webim.SESSION_TYPE = SESSION_TYPE;

        webim.MSG_MAX_LENGTH = MSG_MAX_LENGTH;

        //c2c消息子类型
        webim.C2C_MSG_SUB_TYPE = C2C_MSG_SUB_TYPE;

        //群消息子类型
        webim.GROUP_MSG_SUB_TYPE = GROUP_MSG_SUB_TYPE;

        //消息元素类型
        webim.MSG_ELEMENT_TYPE = MSG_ELEMENT_TYPE;

        //群提示消息类型
        webim.GROUP_TIP_TYPE = GROUP_TIP_TYPE;

        //图片类型
        webim.IMAGE_TYPE = IMAGE_TYPE;

        //群系统消息类型
        webim.GROUP_SYSTEM_TYPE = GROUP_SYSTEM_TYPE;

        //好友系统通知子类型
        webim.FRIEND_NOTICE_TYPE = FRIEND_NOTICE_TYPE;

        //群提示消息-群资料变更类型
        webim.GROUP_TIP_MODIFY_GROUP_INFO_TYPE = GROUP_TIP_MODIFY_GROUP_INFO_TYPE;

        //浏览器信息
        webim.BROWSER_INFO = BROWSER_INFO;

        //表情对象
        webim.Emotions = webim.EmotionPicData = emotions;
        //表情标识符和index Map
        webim.EmotionDataIndexs = webim.EmotionPicDataIndex = emotionDataIndexs;

        //腾讯登录服务错误码(托管模式)
        webim.TLS_ERROR_CODE = TLS_ERROR_CODE;

        //连接状态
        webim.CONNECTION_STATUS = CONNECTION_STATUS;

        //上传图片业务类型
        webim.UPLOAD_PIC_BUSSINESS_TYPE = UPLOAD_PIC_BUSSINESS_TYPE;

        //最近联系人类型
        webim.RECENT_CONTACT_TYPE = RECENT_CONTACT_TYPE;

        //上传资源类型
        webim.UPLOAD_RES_TYPE = UPLOAD_RES_TYPE;


        /**************************************/

        //类对象
        //
        //工具对象
        webim.Tool = tool;
        //控制台打印日志对象
        webim.Log = log;

        //消息对象
        webim.Msg = Msg;
        //会话对象
        webim.Session = Session;
        //会话存储对象
        webim.MsgStore = {
            sessMap: function() {
                return MsgStore.sessMap();
            },
            sessCount: function() {
                return MsgStore.sessCount();
            },
            sessByTypeId: function(type, id) {
                return MsgStore.sessByTypeId(type, id);
            },
            delSessByTypeId: function(type, id) {
                return MsgStore.delSessByTypeId(type, id);
            },
            resetCookieAndSyncFlag: function() {
                return MsgStore.resetCookieAndSyncFlag();
            }
        };

        webim.Resources = Resources;

        /**************************************/

        // webim API impl
        //
        //基本接口
        //登录
        webim.login = webim.init = function(loginInfo, listeners, opts, cbOk, cbErr) {

            //初始化连接状态回调函数
            ConnManager.init(listeners.onConnNotify, cbOk, cbErr);

            //登录
            _login(loginInfo, listeners, opts, cbOk, cbErr);
        };
        //登出
        //需要传长轮询id
        //这样登出之后其他的登录实例还可以继续收取消息
        webim.logout = webim.offline = function(cbOk, cbErr) {
            return proto_logout('instance', cbOk, cbErr);
        };

        //登出
        //这种登出方式，所有的实例都将不会收到消息推送，直到重新登录
        webim.logoutAll = function(cbOk, cbErr) {
            return proto_logout('all', cbOk, cbErr);
        };


        //消息管理接口
        //发消息接口（私聊和群聊）
        webim.sendMsg = function(msg, cbOk, cbErr) {
            return MsgManager.sendMsg(msg, cbOk, cbErr);
        };
        //拉取未读c2c消息
        webim.syncMsgs = function(cbOk, cbErr) {
            return MsgManager.syncMsgs(cbOk, cbErr);
        };
        //拉取C2C漫游消息
        webim.getC2CHistoryMsgs = function(options, cbOk, cbErr) {
            return MsgManager.getC2CHistoryMsgs(options, cbOk, cbErr);
        };
        //拉取群漫游消息
        webim.syncGroupMsgs = function(options, cbOk, cbErr) {
            return MsgManager.syncGroupMsgs(options, cbOk, cbErr);
        };

        //上报c2c消息已读
        webim.c2CMsgReaded = function(options, cbOk, cbErr) {
            return MsgStore.c2CMsgReaded(options, cbOk, cbErr);
        };

        //上报群消息已读
        webim.groupMsgReaded = function(options, cbOk, cbErr) {
            return proto_groupMsgReaded(options, cbOk, cbErr);
        };

        //设置聊天会话自动标记已读
        webim.setAutoRead = function(selSess, isOn, isResetAll) {
            return MsgStore.setAutoRead(selSess, isOn, isResetAll);
        };

        //获取最近会话
        webim.getRecentContactList = function(options, cbOk, cbErr) {
            return proto_getRecentContactList(options, cbOk, cbErr);
        };

        //获取长轮询ID
        webim.getLongPollingId = function(options, cbOk, cbErr) {
            return proto_getLongPollingId(options, cbOk, cbErr);
        };

        //获取下载地址
        webim.applyDownload = function(options, cbOk, cbErr) {
            return proto_applyDownload(options, cbOk, cbErr);
        };


        //检查是否登录
        webim.checkLogin = function(cbErr, isNeedCallBack) {
            return checkLogin(cbErr, isNeedCallBack);
        };
    })(webim);
    return webim;
}();