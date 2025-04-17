import { xor, plain, base64, incog } from './codecs.js';

    const host = document.getElementById("host");
    const site = document.getElementById("site");
    const codecs = document.getElementById("codec");
    const preset = document.getElementById("preset");
    const customInputs = document.getElementById("customInputs");
    host.value = "https://no.datadecay.dev/uv/service/";
    // Execute a function when the user presses a key on the keyboard
site.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("bypassbutton").click();
  }
});
    preset.addEventListener("change", () => {
      switch (preset.value) {
        case "1":
          host.value = "https://no.datadecay.dev/uv/service/";
          codecs.value = "xor";
          customInputs.style.display = "none";
          break;
        case "2":
          host.value = "https://datadecay.koyeb.app/~/uv/";
          codecs.value = "incog";
          customInputs.style.display = "none";
          break;
        case "3":
          host.value = "https://datadecay.koyeb.app/~/scramjet/";
          codecs.value = "plain";
          customInputs.style.display = "none";
          break;
        case "4":
          host.value = "https://orbitmc.lol/@/space/";
          codecs.value = "xor";
          customInputs.style.display = "none";
          break;
        case "5":
          host.value = "https://solve.guide.wedevforyou.com/math/";
          codecs.value = "xor";
          customInputs.style.display = "none";
          break;
        case "6":
          host.value = "https://hello.you.videomixargentina.com/@/daydream/";
          codecs.value = "xor";
          customInputs.style.display = "none";
          break;
        case "7":
          host.value = "https://key.vpn38.ru/uv/service/";
          codecs.value = "xor";
          customInputs.style.display = "none";
          break;
        default:
          alert("Make sure you know what you are doing!");
          host.value = "";
          codecs.value = "plain";
          customInputs.style.display = "block";
      }
    });
    function toURL(input) {
  try {
    const url = new URL(input);
    return url.href;
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(input)) {
      return 'https://' + input;
    }
    return 'https://www.google.com/search?q=' + encodeURIComponent(input);
  }
}

    function bypass() {
      const codec = codecs.value;
      let result;
      let toencode;
      toencode = toURL(site.value)
      try {
  const codecObj = eval(codec);
  if (codecObj && typeof codecObj.encode === "function") {
    result = codecObj.encode(toencode);
  } else {
    alert("Server Error");
    return;
  }
} catch (e) {
  alert("Server Error");
  return;
}


      if (!host.value || !result) {
        alert("Missing host or site.");
        return;
      }
    /*
      var win = window.open();
var url = `${host.value}/${result}`;

win.document.write(`
  <html>
    <head>
      <title>MultiProxy by DataDecay</title>
      <style>
        body { margin: 0; }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="${url}"></iframe>
    </body>
  </html>
`);
win.document.close();
*/
      window.open(`${host.value}${result}`, '_blank');
    }

    document.getElementById("bypassbutton").addEventListener("click", bypass);