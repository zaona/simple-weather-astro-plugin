import AstroBox from "astrobox-plugin-sdk";
let weatherData
let ui

// UI服务启动
let ICSendId = AstroBox.native.regNativeFun(ICSend);
let PickId = AstroBox.native.regNativeFun(onPick);
let OpenBrowserId = AstroBox.native.regNativeFun(openBrowser); // 注册打开浏览器功能
let OpenGuideId = AstroBox.native.regNativeFun(openGuide); // 注册打开浏览器功能
AstroBox.lifecycle.onLoad(() => {
  ui = [
    {
      node_id: "pickFile",
      visibility: true,
      disabled: false,
      content: {
        type: "Input",
        value: {
          text: "",
          callback_fun_id: PickId,
        }
      }
    },
    {
      node_id: "send",
      visibility: true,
      disabled: false,
      content: {
        type: "Button",
        value: { primary: true, text: "发送", callback_fun_id: ICSendId },
      },
    },
    {
      node_id: "openBrowser",
      visibility: true,
      disabled: false,
      content: {
        type: "Button",
        value: { primary: false, text: "打开天气数据查询网站", callback_fun_id: OpenBrowserId }, // 打开浏览器按钮
      },
    },
    {
      node_id: "openGuide",
      visibility: true,
      disabled: false,
      content: {
        type: "Button",
        value: { primary: false, text: "打开数据传输教程", callback_fun_id: OpenGuideId }, // 打开浏览器按钮
      },
    },
    {
      node_id: "tip", // QQ群提示
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: "QQ交流群：947038648",
      },
    },
    {
      node_id: "attention", // 全局提示文本
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: '',
      },
    },
  ];

  AstroBox.ui.updatePluginSettingsUI(ui)
});

/**
 • 处理文件选择事件

 • @param {any} params - 事件参数

 */
function onPick(params) {
  console.log("pick in")
  // 更新输入框的值
  if (params !== undefined) {
    ui[0].content.value.text = params;
    weatherData = params;
    AstroBox.ui.updatePluginSettingsUI(ui);
  } else {
    ui[0].content.value.text = "";
    weatherData = "";
    ui[5].content.value = "请先粘贴天气数据"; // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 数据传输
async function ICSend() {
  if (!weatherData) {
    ui[5].content.value = "请先粘贴天气数据"; // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
    return; // 阻止继续执行
  }

  try {
    const appList = await AstroBox.thirdpartyapp.getThirdPartyAppList()
    const app = appList.find(app => app.package_name == "com.application.zaona.weather")
    if (!app) {
      ui[5].content.value = "请先安装简明天气快应用"; // 更新attention
      AstroBox.ui.updatePluginSettingsUI(ui);
      return; // 阻止继续执行
    }

    await AstroBox.interconnect.sendQAICMessage(
      "com.application.zaona.weather",
      weatherData
    );
    ui[5].content.value = "发送成功" // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);

  } catch (error) {
    console.error(error)
    ui[5].content.value = error // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 打开浏览器功能
function openBrowser() {
  try {
    // 直接打开指定的天气网站，不显示提示
    AstroBox.ui.openPageWithUrl("https://weather.zaona.top/weather");
  } catch (error) {
    console.error("打开浏览器失败:", error);
    // 更新attention
    ui[5].content.value = "打开浏览器失败（weather.zaona.top/weather）";
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 打开数据传输教程页面
function openGuide() {
  try {
    // 打开教程文档页面
    AstroBox.ui.openPageWithUrl("https://www.yuque.com/zaona/weather/plugin");
  } catch (error) {
    console.error("打开浏览器失败:", error);
    // 更新attention
    ui[5].content.value = "打开浏览器失败（www.yuque.com/zaona/weather/plugin）";
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}