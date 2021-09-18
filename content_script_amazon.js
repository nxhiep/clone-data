if(window.location.href.indexOf('amazon.com') > -1){
    var div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '100px'
    div.style.height = '50px'
    div.style.zIndex = "999999"
    var inputOffset = document.createElement('input')
    inputOffset.placeholder = 'Offset'
    inputOffset.value = 1
    div.appendChild(inputOffset)
    var inputLimit = document.createElement('input')
    inputLimit.placeholder = 'Limit'
    inputLimit.value = 10
    div.appendChild(inputLimit)
    var button = document.createElement('button')
    button.innerHTML = "Start copy"
    document.body.appendChild(div)
    div.appendChild(button)
    button.onclick = startCopy
    // button.onclick = () => {
    //     var iframe = document.getElementById('KindleReaderIFrame')
    //     var _document = iframe.contentWindow.document
    //     let content = getContentFromIframe(_document.getElementById('kindleReader_content'));
    //     console.log("content ", content);
    // }
    function startCopy () {
        let content = ''
        let page = 1
        try {
            page = parseInt(inputOffset.value)
        } catch(e){}
        if(page <= 0){
            page = 1
        }
        let timer = setInterval(async () => {
            let maxPage = 10;
            try {
                maxPage = parseInt(inputLimit.value)
            } catch(e){}
            if(maxPage <= 0){
                alert("IQ 200!")
                return;
            }
            var iframe = document.getElementById('KindleReaderIFrame')
            var _document = iframe.contentWindow.document
            let dialog = _document.getElementById('kindleReader_dialog_goto_page')
            let b1 = _document.getElementById('kindleReader_button_goto');
            b1 && b1.click()
            let b2 = _document.getElementById('kindleReader_goToMenuItem_goToPage');
            b2 && b2.click()
            dialog = _document.getElementById('kindleReader_dialog_goto_page').parentElement
            await sleep(200);
            let input = _document.getElementById('kindleReader_dialog_gotoPageField')
            input.value = page
            dialog.querySelectorAll('.ui-dialog-buttonset button')[1].click()
            console.log("load page ", page)
            await sleep(500);
            content += getContentFromIframe(_document.getElementById('kindleReader_content'))
            page += 1;

            if(page >= maxPage){
                var win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
                // win.document.body.innerHTML = '<ul>' + content + '</ul>'
                content = '';
                let keys = Object.keys(mapContent).sort((a, b) => mapIndex[a] && mapIndex[b] ? mapIndex[a].localeCompare(mapIndex[b]) : 0)
                for(let key of keys){
                    content += mapContent[key]
                }
                win.document.body.innerHTML = '<ul style="list-style-type: none;">' + content + '</ul>'
                clearInterval(timer)
            }
        }, 1500)
    }
    var mapContent = {}
    var mapIndex = {}
    var mapImg = {}
    var currentIndex = 0;
    function getContentFromIframe(document) {
        let content = ''
        let iframes = document.querySelectorAll('iframe')
        for(let iframe of iframes){
            currentIndex++;
            let _document = iframe.contentWindow.document
            if(_document){
                console.log("=============================================");
                let ol = _document.querySelector('body > ol');
                if(ol) {
                    let lis = _document.querySelectorAll('body > ol > li');
                    if(!lis || lis.length <= 1) {
                        break;
                    }
                    for(let li of lis) {
                        let id = li.getAttribute('value');
                        id = id ? parseInt(id) : 0
                        let question = "";
                        for(let x of li.querySelectorAll(':scope > .k4w')) {
                            question += x.innerText + " ";
                        }
                        question = question.trim();
                        let imgs = li.querySelectorAll("img");
                        let images = "";
                        for(let img of imgs) {
                            images += img.outerHTML;
                        }
                        if(question && !mapContent[question]) {
                            let c = "<div class='question'><div class='title'>" + id + ". " + question + "</div>";
                            c += "<div class='images'>" + images + "</div>";
                            for(let x of li.querySelectorAll("ol>li")) {
                                c += "<div class='choices' style='padding-left:20px'>" + x.innerText + "</div>";
                            }
                            c += "</div>";
                            content += c;
                            mapContent[question] = c;
                            mapIndex[question] = currentIndex + "-" + id;
                            mapImg[question] = images;
                        }
                    }
                }
            }
        }
        return content
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}