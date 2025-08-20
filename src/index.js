import AstroBox from "astrobox-plugin-sdk";
let courseData
let ui
let file

// UI服务启动
let ICSendId = AstroBox.native.regNativeFun(ICSend);
let PickId = AstroBox.native.regNativeFun(onPick);

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
      node_id: "attention",
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: `请在上方输入框里粘贴json格式数据`,
      },
    }
    ,
    {
      node_id: "tip",
      visibility: true,
      disabled: false,
      content: {
        type: "Text",
        value: `注意：请你先在手环上退出简明天气，以保证此插件能与应用正常通信`,
      },
    }
  ];

  AstroBox.ui.updatePluginSettingsUI(ui)
});

// /**
//  * 从文件路径中提取文件名
//  * @param {string} filePath - 文件路径
//  * @returns {string} 文件名
//  */
// export function getFileName(filePath) {
//   if (!filePath) return '';
//   // 统一路径分隔符并获取最后一部分
//   return filePath.replace(/\\/g, '/').split('/').pop() || '';
// }

// 文件选择
// async function onPick() {
//   console.log("pick in")
//   try {
//     if (file?.path) await AstroBox.filesystem.unloadFile(file.path)
//   } catch (error) {
//     console.error(error)
//     ui[2].content.value = error.message
//     AstroBox.ui.updatePluginSettingsUI(ui)
//   }
//   console.log("no pick in")

//   file = await AstroBox.filesystem.pickFile({
//     decode_text: false,
//   })

//   console.log("pick done")

//   await new Promise(resolve => setTimeout(resolve, 1000));

//   if (!file.path.endsWith(".json")) {
//     // ui[2].content.value = "请选择.json文件";
//     ui[2].content.value = file.path;
//     console.log("检查文件")
//     console.log(file.path)
//     console.log("检测文件done")
//     AstroBox.ui.updatePluginSettingsUI(ui);
//     return;
//   }

//   console.log("检测 过")
//   console.log("文件：")
//   console.log(file.path)

//   courseData = await AstroBox.filesystem.readFile(file.path, {
//     len: file.text_len,
//     decode_text: false
//   });
//   console.log(typeof(courseData))
//   console.log("读取文件")
//   console.log(courseData)
//   ui[2].content.value = `已选择文件 ${getFileName(file.path)}, 现在请你在手环上重新打开澄序课程表，进入数据接收状态`
//   ui[3].content.value = ``
//   ui[1].disabled = false
//   AstroBox.ui.updatePluginSettingsUI(ui)
// }

/**
 * 处理文件选择事件
 * @param {any} params - 事件参数
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
    ui[2].content.value = "请先填写配置信息";
    AstroBox.ui.updatePluginSettingsUI(ui);
  }
}

// 数据传输
async function ICSend() {
  if (!courseData) {
    ui[2].content.value = "请先填写配置信息";
    AstroBox.ui.updatePluginSettingsUI(ui);
    return;
  }

  try {
    const appList = await AstroBox.thirdpartyapp.getThirdPartyAppList()
    const app = appList.find(app => app.package_name == "com.application.zaona.weather")
    if (!app) {
      ui[2].content.value = "请先安装简明天气快应用 或 连接设备 或 在手环上重新打开简明天气";
      AstroBox.ui.updatePluginSettingsUI(ui);
      return;
    }

    await AstroBox.interconnect.sendQAICMessage(
      "com.application.zaona.weather",
      JSON.stringify(JSON.parse(courseData))
    );
    ui[2].content.value = "发送成功，如果手环上出现数据加载异常/黑屏，\n大概率是数据问题，请自行检查"
    AstroBox.ui.updatePluginSettingsUI(ui)
  } catch (error) {
    console.error(error)
    ui[2].content.value = error
    AstroBox.ui.updatePluginSettingsUI(ui)
  }
}