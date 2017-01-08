getCurrentUrl();

function getCurrentUrl() {

    var bookName, pages, src;
    var flag = true;

    var arrayName = document.querySelectorAll("div.top_bookname"); //page combobox
    //console.log(arrayName);
    if (arrayName.length != 0) {
        bookName = arrayName["0"].innerText;
        console.log(bookName);
    } else {
        flag = false;
        alert("找不到書本");
    }

    var arrayOpts = document.querySelectorAll("option"); //page combobox
    //console.log(arrayOpts.length);
    if (arrayOpts.length != 0) {
        pages = (arrayOpts.length - 1) * 2; //calculate  amount of pages
        console.log("Page length:"+pages);
    } else {
        flag = false;
        alert("找不到書碼");
    }

    var arrayLis = document.querySelectorAll("li img"); //page
    //console.log(arrayLis);
    if (arrayLis.length != 0) {
        src = arrayLis[0].src //retrive first img url
        console.log("Parsing url: "+src);
    } else {
        flag = false;
        alert("找不到內容");
    }

    //http://voler.ebook4rent.tw/book/img?p=1&f=jpg&r=150&preferWidth=950&preferHeight=1920&bookId=xxxx&token=xxx&bookToken=xxx
    if(src.indexOf("?p=1&")<0){
        flag = false;
        alert("找不到封面位址");
    }

    //url length enough, and pages more than one
    if (flag && src.length > 40 && pages > 1) {
        var links = [];
        var src1 = src.substring(0, 38); //head
        var src2 = src.substring(39); //tail
        //pages = 3; //for test
        for (i = 1; i <= pages; i++) {
            links.push(src1 + i + src2);
        }

        if (tempIndex === undefined || tempIndex < 0) {
            tempIndex = 0;
        }
        console.log("Send index:"+tempIndex);

        //console.log(links);
        chrome.extension.sendRequest({
            links: links,
            dir: bookName,
            index: tempIndex
        });
    }
}

var tempIndex;
//chrome.runtime.onMessage.removeListener(saveIndex);

if (typeof chrome.runtime.onMessage.myListenerAdded == "undefined")
{
    chrome.runtime.onMessage.myListenerAdded = true;//avoid duplicate listener
    chrome.runtime.onMessage.addListener(saveIndex);
}
function saveIndex(request, sender, sendResponse) {
    console.log("Save index:");
    console.log(request);
    tempIndex = request.index;
}
