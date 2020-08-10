/**
 * Created by levin on 14/12/2.
 * @desc 常用工具类库，为widget、plugin等功能性库提供依赖
 *
 */
;
(function () {

    "use strict";

    var _util = {};
    //缓存原型句柄
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FunProto = Function.prototype;
    //缓存原型句柄中的常用方法
    var slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;
    //原生方法 ECMAScript 5
    var nativeIsArray = Array.isArray,
        nativeKeys = Array.keys;

    /**
     * @method isString
     * @param obj
     * @returns {boolean}
     * @desc 判断传入对象是否是字符串类型
     */
    _util.isString = function (obj) {
        return toString.call(obj) == '[object String]';
    };

    /**
     * @method isArray
     * @type {Function|*|_.isArray}
     * @desc 判断当前对象是否是数组类型
     */
    _util.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) == '[object Array]';
    };

    /**
     * @method isObject
     * @param obj
     * @returns {boolean}
     * @desc 判断当前对象是否是对象类型
     */
    _util.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    /**
     * @method isDate
     * @param obj!
     * @returns {boolean}
     * @desc 判断当前对象是否是时间类型
     */
    _util.isDate = function (obj) {
        return toString.call(obj) == '[object Date]';
    };

    /**
     * @method getQueryVal
     * @param name 参数名
     * @param url (可选)如果从当前页面URL中获取参数值，url参数可以不用指定
     * @returns {string}
     * @desc 根据参数名从当前地址或指定地址中获取参数值
     */
    _util.getQueryVal = function (name, url) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r;
        //如果url有指定，那么从指定的地址中取值
        if (url && url.indexOf('?') != -1) {
            r = url.split('?')[1].match(reg);
        } else {
            //默认从当前页面地址中取值
            r = window.location.search.substr(1).match(reg); //r = ['匹配到的主串', $1, $2, $3, index, input]$1..9为正则表达式圆括号匹配的子串
        }
        if (r != null) return decodeURIComponent(r[2]);
        return '';
    };

    /**
     * @method trim
     * @param obj
     * @returns {string}
     * @desc 清除字符串两边的空白字符
     */
    _util.trim = function (obj) {
        return _util.isString(obj) ? obj.replace(/^\s+|\s+$/g, '') : '';
    };

    /**
     * @method extend
     * @param obj
     * @returns {*}
     * @desc 对象属性的扩展
     * @example _util.extend({aa:'abc',cc:'like that'},{aa:'cba',bb:'like this'})
     *          结果：{aa:'cba',bb:'like this',cc:'like that'}
     */
    _util.extend = function (obj) {
        if (!_util.isObject(obj)) {
            return obj;
        }
        var source, prop;
        for (var i = 0, l = arguments.length; i < l; i++) {
            source = arguments[i];
            for (prop in source) {
                if (hasOwnProperty.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    /**
     * @method sendStatistic
     * @param para 统计属性
     * @param next 发送统计后要执行的方法
     * @desc 发送统计请求，原理创建一个img对象，图片源为一个1*1像素的图片，这样可以解决统计请求域与功能页存放的域不一致的问题。
     * @example
     *      //统计属性参数
     *      var opt = {
     *          curpageid:xxx, //活动ID
     *          type:xxx,//页面名称
     *          fuid:xxx,//页面展现或某个操作名称，如：页面展示-> show; 查看按钮点击操作：view_click(可自定义)
     *          uid:xxx,//用户ID
     *          cid:xxx//渠道ID
     *      };
     *      //统计发送后要执行的方法(一般发送完统计再进行跳转页面的情况居多)
     *      var next = function(){
     *          window.location = 'www.mi.com';
     *      }
     *      //发送统计
     *      _util.sendStatistic(opt,next);
     */
    _util.sendStatistic = function (para, next) {
        //固定的统计域名地址
        var url = 'https://data.game.xiaomi.com/1px.gif?ac=xm_client&client=sales_pic&type=live_h5_operateactivity';
        if (!para) {
            return;
        }
        var str = '',
            prop;
        for (prop in para) {
            if (hasOwnProperty.call(para, prop)) {
                str += '&' + prop + '=' + para[prop];
            }
        }
        url += str + '&_' + (new Date()).getTime();
        var img = new Image();
        img.error = img.onload = function () {
            next && next();
        };
        img.src = url;
    };

    /**
     * @method isWXPlatform
     * @returns {boolean}
     * @desc 判断当前页面是否在微信平台中
     */
    _util.isWXPlatform = function () {
        return /MicroMessenger/i.test(navigator.userAgent);
    };


    /**
     * @method ajaxReq
     * @param _url 请求地址
     * @param _type 请求类型（可选）
     * @param _param 请求参数
     * @param _successCb 请求成功后要执行的回调方法
     * @param _errCb 请求失败要执行的回调方法
     * @desc 封装的ajax请求
     */
    _util.ajaxReq = function (_url, _type, _param, _successCb, _errCb) {
        var option = {
            type: _type || 'get',
            url: _url,
            data: _param,
            dataType: 'json',
            cache: false,
            timeout: 5000,
            success: function (res, status, xhr) {
                if (!res) {
                    _errCb && _errCb(null);
                    return;
                }
                if (res.code != '200') {
                    _errCb && _errCb(res);
                    return;
                }
                _successCb && _successCb(res);
            },
            error: function (xhr, ts, err) {
                _errCb && _errCb(err);
            }
        };
        $.ajax(option);
    };

    /**
     * @method 创建遮罩
     * @param _conf 遮罩的CSS样式 CSS类名或者JS对象{property: value}
     * @param _content 遮罩内容
     * @param _registerEv 遮罩内容绑定事件
     */
    _util.mask = function (_conf, _content, _registerEv) {
        var is_100 = ($(window).height() > $(document.body).height()) ? true : false;
        var
            $mask = $('<div id="bg_mask"></div>'),
            $maskStyle = {
                "position": "absolute",
                "left": 0,
                "top": 0,
                "height": !is_100 ? '100%' : $(window).height(),
                "bottom": 0,
                'width': '100%',
                "background": "rgba(0, 0, 0, .7)",
                'z-index': 9999
            };
        if (!!_conf) {
            if (_util.isObject(_conf)) {
                _util.extend($maskStyle, _conf);
            } else if (_util.isString(_conf)) {
                $mask.addClass(_conf);
            }
        }
        $mask.css($maskStyle);
        $(document.body).css({
            'position': 'relative'
        }).append($mask);

        /***************** 寮€濮嬪悜閬僵娣诲姞鍐呭 ****************/
        if (!!_content && _util.isArray(_content)) {
            for (var i = 0, size = _content.length; i < size; i++) {
                var $content = '';
                if (_util.isArray(_content[i].content)) {
                    for (var j = 0, len = _content[i].content.length; j < len; j++) {
                        $content += _content[i].content[j];
                    }
                } else {
                    $content = _content[i].content;
                }
                $(_content[i].parentNodeSelector).append($(_content[i].tag).addClass(_content[i].className).html($content));
            }
        }

        /* 闃叉鐐归€� */
        $mask.on('touchmove', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });

        _util.registerEvent(_registerEv);
    };

    /**
     * @method registerEvent
     * @param _evs 元素监听事件配置对象
     * @desc 注册事件
     */
    _util.registerEvent = function (_evs) {
        if (!!_evs && _util.isArray(_evs)) {
            for (var i = 0, size = _evs.length; i < size; i++) {
                if (_evs[i].eventType === 'swipe') {
                    $(_evs[i].selector).swipe({
                        tap: _evs[i].listener
                    });
                } else if (_evs[i].eventType === 'touch') {
                    $(_evs[i].selector).touch({
                        tap: _evs[i].listener
                    });
                } else {
                    $(_evs[i].selector).on(_evs[i].eventType, _evs[i].listener);
                }
            }
        }
    };

    // 判断是否是米聊
    _util.isMiTalk = function () {
        var client = window.MLJsHandler,
            userId = _util.getCookie('userId') != "",
            nick = _util.getCookie('nick') != "",
            avatar = _util.getCookie('avatar') != "",
            passToken = _util.getCookie('passToken') != "",
            serviceToken = _util.getCookie('serviceToken') != "",
            miVersion = _util.getCookie('miVersion') != "";
        return (client && client.jsCallBack) || userId || miVersion || serviceToken || passToken || nick || avatar;
    };

    /**
     * @desc 在miui浏览器中判断是否安装了某个app
     * @param packageName 应用包名
     */
    _util.isInstalled = function (packageName) {
        return !!window.miui && !!window.miui.getApkVersion && window.miui.getApkVersion(packageName) > 0
    };

    /**
     * @desc 生成某个范围内的随机数, eg: random(0, 10)生成0-9的随机整数
     * @param min
     * @param max
     */
    _util.random = function (min, max) {
        return Math.floor(min + Math.random() * (max - min));
    };

    /**
     * @desc 获取指定cookie值
     * @param c_name
     * @returns {string}
     */
    _util.getCookie = function (c_name) {
        var c_start = 0,
            c_end = 0;
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return document.cookie.substring(c_start, c_end);
            }
        }
        return ""
    };
    /**
     * @desc 通过UA判断设备
     *
     * */
    var _device = _util.device = (function () {
        var _deviceReg = [
            /(MI(\s+)|2013022|2013023|HM|2014011|2014501|2014813|2014811|2014812|2014817|2014818|2014819|2014502|2015|xiaomi).*/i,
            /(MI(.*|\s*)PAD).*/i,
            /(iPhone | iPod).*/i,
            /(iPad).*/i
        ];
        var _ua = (navigator.userAgent).toLowerCase();
        var _miPhoneMap = {
            'miphone': '小米手机',
            'mione': '小米手机',
            'MI-ONE C1': '小米手机1',
            'MI-ONE Plus': '小米手机1',
            'mi 1s': '小米手机1s',
            'mi-2': '小米手机2',
            'mi 2a': '小米手机2A',
            'mi 2s': '小米手机2s',
            'mi 2': '小米手机2',
            '2013022': '红米手机',
            '2013023': '红米手机',
            '2014011': '红米手机1S',
            '2014501': '红米手机1S',
            'hm 1s': '红米手机1s',
            'hm 1': '红米手机1',
            'hm 2lte': '红米手机2',
            'HM 2A': '红米手机2A',
            '2014112': '红米手机2',
            '2014821': '红米手机2',
            '2014811': '红米手机2',
            '2014812': '红米手机2',
            '2014813': '红米手机2',
            '2014817': '红米手机2',
            '2014819': '红米手机2',
            'Redmi 3': '红米手机3',
            'hm note 1': '红米Note1',
            'HM NOTE 2': '红米Note2',
            'Redmi Note 2': '红米Note2',
            'Redmi Note 3': '红米Note3',
            'mi 3': '小米手机3',
            'mi 4s': '小米手机4s',
            'Mi 4c': '小米手机4c',
            'mi 4': '小米手机4',
            'Mi 5': '小米手机5',
            'mi note': '小米Note',
            'mi pad': '小米平板',
            'MIPAD2': '小米平板2'
        };

        return {
            /*** 判断是否是iphone或者ipod ***/
            isIPhone_Pod: function () {
                return _deviceReg[2].test(_ua);
            },
            /*** 判断是否是ipad ***/
            isIPad: function () {
                return _deviceReg[3].test(_ua);
            },
            /*** 判断是否是miphone ***/
            isMiPhone: function () {
                return _deviceReg[0].test(_ua) && !this.isMiPad();
            },
            /*** 判断是否是MiPad ***/
            isMiPad: function () {
                return _deviceReg[1].test(_ua);
            },
            /*** 获取小米手机机型 */
            miType: function () {
                var _type = 'none';
                if (!this.isMiPhone()) {
                    return _type;
                }
                for (var k in _miPhoneMap) {
                    if (_ua.indexOf(k.toLowerCase()) > 0) {
                        _type = _miPhoneMap[k];
                        break;
                    }
                }
                return _type;
            }
        };
    })();

    /**
     * @desc 通过UA判断手机系统
     *
     * */
    var _sys = _util.sys = (function () {
        var _sysReg = [
            /(Android).*/i,
            /(iPhone|iPad|iPod|iOS).*/i,
            /(windows(.*|\s*)phone).*/i
        ];
        var _ua = (navigator.userAgent).toLowerCase();
        return {
            /* 判断是否是Android */
            isAndroid: function () {
                return _sysReg[0].test(_ua);
            },
            /* 判断是否是IOS */
            isIOS: function () {
                return _sysReg[1].test(_ua);
            },
            /*** 判断是否是其它安卓设备 ***/
            isOtherAndroid: function () {
                return _sys.isAndroid() && !_device.isMiPad() && !_device.isMiPhone();
            },
            /*** 判断是否是winphone ***/
            isWinPhone: function () {
                return _sysReg[3].test(_ua);
            },
            /*** 获取手机系统 */
            which: function () {
                if (this.isAndroid()) {
                    return 'android';
                }
                if (this.isOtherAndroid()) {
                    return 'other-android';
                }
                if (this.isIOS()) {
                    return 'ios';
                }
                if (this.isWinPhone()) {
                    return 'win';
                }
                return 'none';
            }
        };
    })();

    /**
     * @desc 通过UA判断页面所在的app
     *
     * */
    var _app = _util.app = (function () {
        var _appReg = [
            /MicroMessenger/i,
            /gc\-app/i,
            /mizhiBo/i,
            /weibo/i,
            /QQBrowser/i,
            /MiuiBrowser/i,
            /smarthome/i
        ];
        var _ua = (navigator.userAgent).toLowerCase();
        return {
            /* 判断是否是在微信app下 */
            isWeixin: function () {
                return _appReg[0].test(_ua);
            },
            /* 判断是否是在小米游戏app下 */
            isMiGC: function () {
                return _appReg[1].test(_ua);
            },
            /*** 判断是否是在直播app下 ***/
            isZhiBo: function () {
                return _appReg[2].test(_ua);
            },
            /*** 判断是否是在微博app下 ***/
            isWeiBo: function () {
                return _appReg[3].test(_ua);
            },
            /***  判断是否是在QQ下 ***/
            isQQ: function () {
                return _appReg[4].test(_ua);
            },
            /***  判断是否是在小米浏览器下 ***/
            isMIBrowser: function () {
                return _appReg[5].test(_ua);
            },
            /***  判断是否是在智能家庭下 ***/
            isSmartHome: function () {
                return _appReg[6].test(_ua);
            },
            /*** 获取app平台 */
            which: function () {
                if (this.isWeixin()) {
                    return 'weixin';
                }
                if (this.isMiGC()) {
                    return 'migc';
                }
                if (this.isZhiBo()) {
                    return 'zhibo';
                }
                if (this.isWeiBo()) {
                    return 'weibo';
                }
                if (this.isQQ()) {
                    return 'qq';
                }
                if (this.isMIBrowser()) {
                    return 'miBrowser';
                }
                return 'none';
            }
        };

    })();

    /**
     * @desc 检查是否登陆
     * 该方法使用的时候，要传一个对象, eg: {uuid: 5199, st: 'xxxx'}
     */
    var _checkIsLogin = _util.checkIsLogin = (function () {

        function download(zuid) {
            var ua = navigator.userAgent;
            var lowerUa = ua.toLowerCase();
            if (!/micromessenger/.test(lowerUa)) {
                let url = encodeURIComponent(`${window.location.href.split("?")[0]}?zuid=${zuid}`);
                location = `walilive://openurl/newwindow?url=${url}&sharable=true&ishalf=false`;
                setTimeout(function () {
                    location = checkPlatform();
                }, 5 * 1000);
            } else {
                location = checkPlatform();
            }
        };

        // 检查平台
        function checkPlatform() {
            var ua = navigator.userAgent;
            var lowerUa = ua.toLowerCase();
            if (/micromessenger/.test(lowerUa)) {
                return "http://a.app.qq.com/o/simple.jsp?pkgname=com.wali.live";
            } else if (/iphone/.test(lowerUa)) {
                return "https://itunes.apple.com/cn/app/id1095089970?mt=8";
            } else {
                return "http://app.mi.com/details?id=com.wali.live";
            }
        }

        return function (obj = {}) {
            var ua = navigator.userAgent;
            var lowerUa = ua.toLowerCase();
            if (!(obj.uuid && obj.uuid <= 4000000000 && obj.st)) {
                if (_app.isZhiBo()) {
                    window.location.href = 'walilive://unlogin?closeWebview=true';
                } else if (/micromessenger/.test(lowerUa)) {
                    const REDIRECT_URI = "http://weixin.zb.mi.com/oauth/login?share_url=" + encodeURIComponent(window.location.href);

                    window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0f7c40ebbcf236fe&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
                        "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
                } else {
                    download(obj.zuid);
                }
                return false;
            } else {
                return true;
            }
        }
    })()


    var _appVersion = _util.appVersion = (function () {

    })()

    /**
     * @desc 个位数变为双位数
     */
    var toDuble = _util.toDuble = (function () {
        return function (num) {
            return num < 10 ? `0${num}` : num;
        }
    })()

    /**
     * @desc 时间格式化
     */
    var timeFormat = _util.timeFormat = (function () {

        return function (leftTime) {
            let oTime = {
                d: '00',
                h: '00',
                m: '00',
                s: '00'
            };

            if (leftTime > 0) {
                oTime = {
                    s: toDuble(Math.floor(leftTime % 60)),
                    m: toDuble(Math.floor(leftTime / 60 % 60)),
                    h: toDuble(Math.floor(leftTime / (60 * 60) % 24)),
                    d: Math.floor(leftTime / (60 * 60 * 24))
                };
            }
            return oTime;
        }
    })()

    /**
     * @desc 通过ua返回语言
     */
    var language = _util.language = (function () {
        var _language = navigator.userAgent,
            __language = navigator.language,
            reg = [
                /zh_hans|cn/i,
                /en/i,
                /hk|tw|zh_han/i
            ];
        return {
            isCN: reg[0].test(_language),
            isEN: reg[1].test(_language),
            isSar: reg[2].test(_language),
            which: function () {
                if (this.isCN) {
                    return 'cn';
                }
                if (this.isEN) {
                    return 'en';
                }
                if (this.isSar) {
                    return 'tw';
                } else {
                    if (reg[0].test(__language)) {
                        return 'cn';
                    } else if (reg[1].test(__language)) {
                        return 'en';
                    } else if (reg[2].test(__language)) {
                        return 'tw';
                    } else {
                        return 'en';
                    }
                }
            }
        };
    })();

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return _util;
        });
    } else if (typeof module != void 0 && module.exports) {
        module.exports = _util;
    } else {
        window.mi.util = _util;
    }
})();