function renderStatus(statusText) {
    document.getElementById('status').textContent = statusText;
}

var links, index, dir, id;


chrome.downloads.onChanged.addListener(function(delta) {
    //moniter download
    //console.log("ebookservice listener");
    if (!delta.state ||
        (delta.state.current != 'complete')) {
        return;
    }
    if (id != delta.id) {
        return;
    }
    //download complete
    if (index < links.length) {
        downloadLinks(links, dir, index);
    } else {
        window.close();
    }
});

chrome.extension.onRequest.addListener(function(response) {
    renderStatus('下載中，請勿離開此頁面');
    dir = response.dir;
    dir = sanitize(dir, '');
    //dir = dir.replace(/\\/, "-");
    links = response.links;
    index = response.index;

    if (index > 0) {
        if (index < links.length) {
            var r = confirm("是否接續下載?(" + (index + 1) + "/" + links.length + ")");
            if (r != true) {
                index = 0;
            }
        } else {
            var r = confirm("重新下載?");
            if (r != true) {
                window.close();
                return;
            }
            index = 0;
        }
    }

    downloadLinks(links, dir, index);
});

// Download all visible checked links.
function downloadLinks(link, dir, indexLocal) {
    var pageNum = padLeft((indexLocal + 1), 3);
    renderStatus('下載中，請勿離開此頁面(' + pageNum + '/' + link.length + ')');
    var file = "./" + dir + "/img" + pageNum + ".jpg";
    //need reload permissions
    chrome.downloads.download({
            url: link[indexLocal],
            filename: file
        },
        function(downloadId) {
            //send index to content script
            if (downloadId === undefined) {
                console.log(chrome.runtime.lastError);
                console.log(file);
                renderStatus('下載發生錯誤');
            } else {
                console.log(downloadId + " Ok");
                id = downloadId;
                index = index + 1;
                //send to content script
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        index: index
                    });
                });
            }
        });
    //window.close();
}

/* 左邊補0 */
function padLeft(str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join("0") + str;
}

//execute content script
chrome.tabs.executeScript(null, {
    file: "content_script.js"
});

var illegalRe = /[\/\?<>\\:\*\|":]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement) {
  var sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return sanitized;
}