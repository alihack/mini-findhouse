# 房牛找房  -- chenli 2019.3.26

====================================
wepy开发文档地址
https://tencent.github.io/wepy/

##启动

1、安装 wepy 命令行工具。
npm install wepy-cli -g

2、安装依赖包
npm install

3、开发实时编译。
npm run dev

##开发使用说明(重要)

1、使用微信开发者工具-->添加项目，项目目录请选择dist目录。

2、微信开发者工具-->项目-->关闭ES6转ES5。 重要：漏掉此项会运行报错。

3、微信开发者工具-->项目-->关闭上传代码时样式自动补全。 重要：某些情况下漏掉此项也会运行报错。

4、微信开发者工具-->项目-->关闭代码压缩上传。 重要：开启后，会导致真机computed, props.sync 等等属性失效。

##目录结构

├── app.wpy                 //入口文件
|
├── components                //组件
│   ├── bar_chat.wpy            //聊天工具栏
│   ├── bar_sort.wpy            //房源筛选工具栏
│   ├── footer.wpy              //列表底部广告
│   ├── list_house.wpy          //房源列表
│   ├── modal_author.wpy        //授权弹窗
│   ├── my_agent.wpy            //我的经纪人
│   ├── my_login_sms.wpy        //短信登录
│   ├── my_login_wx.wpy         //微信登录
│   ├── my_user.wpy             //我的用户
│   ├── panel_fixed.wpy         //房源详情之底部固定栏
│   ├── panel_houseDetail.wpy   //房源详情之房屋
│   ├── panel_source.wpy        //房源详情之推荐房源&同一小区
│   ├── panel_support.wpy       //房源详情之配套
│   ├── poster_modal.wpy        //海报表单
│   └── poster.wpy              //生成海报
|
├── images                      //图片文件夹
|
├── pages                     //页面
│   ├── chat.wpy                //聊天
│   ├── detail_estate.wpy       //小区详情
│   ├── detail_sameEstate.wpy   //同小区房源
│   ├── detail_support.wpy      //周边配套
│   ├── detail.wpy              //房源详情
│   ├── index_search.wpy        //主页城市搜索（目前没用到，可能之后会用）
│   ├── index.wpy               //主页
│   ├── message.wpy             //聊天列表页
│   ├── my.wpy                  //我的
│   ├── user_history.wpy        //用户历史记录
│   └── user_mark.wpy           //用户收藏
|
├── styles                  //样式
|
└── utils                     //工具类
    ├── api.js                  //接口
    ├── config.js               //配置
    ├── qiniuUploader.js        //七牛云
    ├── qqmap-wx-jssdk.js       //腾讯地图
    ├── qqmap-wx-jssdk.min.js   //腾讯地图
    ├── util.js                 //通用方法
    └── webim_wx.js             //云通信

======================================