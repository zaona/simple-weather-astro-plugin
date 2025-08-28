import AstroBox from "astrobox-plugin-sdk";
let courseData
let ui
let file

// UI服务启动
let ICSendId = AstroBox.native.regNativeFun(ICSend);
let PickId = AstroBox.native.regNativeFun(onPick);
let OpenBrowserId = AstroBox.native.regNativeFun(openBrowser); // 注册打开浏览器功能

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
      node_id: "step1", // 第一行提示
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: "①第一步：在网站中查询并复制天气数据",
      },
    },
    {
      node_id: "step2", // 第二行提示
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: "②第二步：在上方输入框中粘贴json格式天气数据",
      },
    },
    {
      node_id: "step3", // 第三行提示
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: "③第三步：连接手环后打开简明天气，然后点击发送。",
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
    courseData = params;
    AstroBox.ui.updatePluginSettingsUI(ui);
  } else {
    ui[0].content.value.text = "";
    courseData = "";
    ui[6].content.value = "请先填写天气信息"; // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 数据传输
async function ICSend() {
  if (!courseData) {
    ui[6].content.value = "请先填写天气信息"; // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
  }

  try {
    const appList = await AstroBox.thirdpartyapp.getThirdPartyAppList()
    const app = appList.find(app => app.package_name == "com.application.zaona.weather")
    if (!app) {
      ui[6].content.value = "请先安装简明天气快应用 或 连接设备 或 在手环上重新打开简明天气"; // 更新attention
      AstroBox.ui.updatePluginSettingsUI(ui);
    }

    await AstroBox.interconnect.sendQAICMessage(
      "com.application.zaona.weather",
      JSON.stringify(JSON.parse(courseData))
    );
    ui[6].content.value = "发送成功，如果手环上出现数据加载异常/黑屏，\n大概率是数据问题，请自行检查" // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);

  } catch (error) {
    console.error(error)
    ui[6].content.value = error // 更新attention
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 修改后的打开浏览器功能
function openBrowser() {
  try {
    // 直接打开指定的天气网站，不显示提示
    AstroBox.ui.openPageWithUrl("https://weather.zaona.top/weather");
  } catch (error) {
    console.error("打开浏览器失败:", error);
    // 更新attention
    ui[6].content.value = "打开浏览器失败，请手动前往weather.zaona.top/weather";
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}