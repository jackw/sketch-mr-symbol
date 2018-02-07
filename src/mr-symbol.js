import WebUI from 'sketch-module-web-view';
import _ from 'lodash';

// function sortArrayRecursively(array, prop) {
//   array.forEach(item => {
//     const keys = _.keys[item];
//     keys.forEach(key => {
//       if (_.isArray(item[key])) {
//         item[key] = sortArrayRecursively(item[key], prop);
//       }
//     });
//   });
//   return _.sortBy(array, prop);
// }

function insertIntoTree(children = [], [head, ...tail], symbol) {
  let child = children.find(child => child.name === head);

  if (!child) {
      const isSymbol = head == symbol.path[symbol.path.length-1];
      if (isSymbol) {
          children.push(child = {name: head, id: symbol.id, children: [], type: 'symbol'});
      } else {
          children.push(child = {name: head, children: [], type: 'folder'});
      }
  }

  if (tail.length > 0) {
    insertIntoTree(child.children, tail, symbol);
  }

  return children;
}

const getSymbolTree = (symbols) => {
  return symbols.map(symbol => (symbol.path = symbol.name.split('/'), symbol))
  .reduce((tree, symbol) => insertIntoTree(tree, symbol.path, symbol),[]);
};

const getSymbols = (context) => {
  if (!context) {
    return;
  }
  const documentData = context.document.documentData();
  const symbols = documentData.localSymbols();

  return _.map(symbols, (symbol) => {
    return {
      name: `${symbol.name()}`,
      id: `${symbol.symbolID()}`,
      hash: symbol.hash()
    };
  });
}

export default function(context) {
  if (context && context.document) {
    const symbols = getSymbols(context);
    const symbolTree = getSymbolTree(symbols);

    const webUI = new WebUI(context, require('../resources/webview.html'), {
      identifier: 'unique.id', // to reuse the UI
      x: 0,
      y: 0,
      width: 240,
      height: 180,
      blurredBackground: true,
      onlyShowCloseButton: true,
      hideTitleBar: false,
      shouldKeepAround: true,
      frameLoadDelegate: { // https://developer.apple.com/reference/webkit/webframeloaddelegate?language=objc
        'webView:didFinishLoadForFrame:'(webView, webFrame) {

        }
      },
      handlers: {
        nativeLog(s) {
          context.document.showMessage(s)

          webUI.eval(`setRandomNumber(${Math.random()})`)
        },
        getData() {
          console.log('getting data from sketch');
          webUI.eval(`window.mrSymbolTree=${JSON.stringify(symbolTree)}`);
          webUI.eval(`window.mrSymbol=${JSON.stringify(symbols)}`);
        }
      }
    });

  }
}