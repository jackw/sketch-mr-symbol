
import pluginCall from "sketch-module-web-view/client";

const app = document.getElementById('app');
app.addEventListener('click', () => {
    pluginCall('getData');
    console.log('getting data at webview');
    console.log(window.mrSymbolTree);
});
