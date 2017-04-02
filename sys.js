function arrToSpecStr(arr, separator, head, tail){
    var res = head;
    if(arr.length){
        if(arr.length != 1)
            for(var y = 0;y<arr.length-1;y++){
                res +=arr[y]+separator;
            }
        res +=arr[arr.length-1]+tail;
    }
    return res;
}


function log(text){
    if(debug){
        stb.Debug(text);
    }
}


function $(id){
    return document.getElementById(id);
}


function byclass(classname){
    return document.getElementsByClassName(classname);
}

// подпись - добавляется после каждого запроса к серверу
function createSign(data){
    var str = '';
    var res = '';
    for (var key in data) {
        if(key == 'session' && empty(data[key])){
            continue;
        }
        var arg = key+'='+data[key];
        str += arg;
        res += arg+'&';
    }
    str = hex_md5(str+'09441482eab7a925')+'_sgmag250';
    res += 'sign='+str;
    return res;

}



function sendreq(url, callback, hide_blackbg){
    try {
        if(hide_blackbg != true){
            show_waiting();
        }
        echo('REQUEST URL: '+url);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onreadystatechange = function ()
        {
            if (request.readyState == 4 && request.status == 200) {
                var answer = request.responseText;
                log('==== hide_waiting at sendreq ====');
                echo('server ansver is = '+answer);
                newAlert_on = false;
                document.getElementsByClassName('modal')[0].style.display = 'none';
                if(CUR_LAYER != layer_player && CUR_LAYER != layer_search) CUR_LAYER = layer_cats;
                echo('sendreq()->there is ansver for url'+url);
                callback(answer);
            }else{
                if(request.readyState == 4 && request.status != 200){
                    if(currLst == extSubCatLst|| currLst == searchResultLst) retry_request(url,callback,hide_blackbg);
                    else  retry_request_once(url,callback,hide_blackbg);
                    echo('request error for url='+url+' error responseText='+request.responseText);
                    echo('error status='+request.status+' error readyState='+request.readyState);
                }
            }
        };
        request.send(null); // send object
    } catch (e) {
        return;
    }
}


/**
 * спам сервера запросами о следующей порции фильмов в случае неудачи первого запроса
 *
 */
var loading_request_retry_number=0;
function retry_request(url, callback, hide_blackbg){
    echo('retry_request(url, callback, hide_blackbg)');
    // вычисляем номер проблемной страницы
    var start_point = url.search('offset=')+7;
    var offset = url.substring(start_point,start_point+8);
    offset=parseInt(offset);
    echo('start_point='+start_point+' offset='+offset);
    var page=Math.ceil(offset/(vars[win.height].ext_cont_page_x_max*2));
    request_attempt[page]=1;
    // посылаем по повторному запросу каждые 5 секунд
    var set_Interval_id = setInterval(function() {
        loading_request_retry_number++;
        // ajax
        request_attempt[page]+=1;
        echo(request_attempt[page]+' request attempts for page '+page);
        
        echo('retry_request()->REQUEST URL: '+url);
        var sec_request = new XMLHttpRequest();
        sec_request.open('GET', url, true);
        sec_request.onreadystatechange = function ()
        {
            if (sec_request.readyState == 4 && sec_request.status == 200) {
                echo('_____server is not dead, but have some problems with requests ('+loading_request_retry_number+' atttemts to reconnect)_____');
                var answer = sec_request.responseText;
                loading_request_retry_number=0;
                clearInterval(set_Interval_id);
                callback(answer);
            }
        }
        sec_request.send(null); 
        
        if(loading_request_retry_number>=20){ // если сервер 100 sec не отвечает значит он мертв
            loading_request_retry_number=0;
            clearInterval(set_Interval_id);
            echo('SERVER IS DOWN? -> 21 requests was send and i didnt get any ansver!');
        }
    }, 5000)
    return;
} 


/**
 * повторная посылка запроса через 3 сек на следующую порцию фильмов в случае неудачи первго запроса
 *
 */
function retry_request_once(url, callback, hide_blackbg){
    setTimeout(function() {
       try {
        if(hide_blackbg != true){
            show_waiting();
        }
        echo('second REQUEST URL: '+url);
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onreadystatechange = function ()
        {
            if (request.readyState == 4 && request.status == 200) {
                var answer = request.responseText;
                log('==== hide_waiting ====');
                newAlert_on = false;
                document.getElementsByClassName('modal')[0].style.display = 'none';
                if(CUR_LAYER != layer_player && CUR_LAYER != layer_search) CUR_LAYER = layer_cats;
                echo('retry_request_once()->there is ansver for url'+url);
                callback(answer);
            }else{
                if(request.readyState == 4 && request.status != 200){
                    echo('retry_request_once error for url='+url);
                    echo('retry_request_once error responseText='+request.responseText);
                    echo('retry_request_once error status='+request.status);
                    echo('retry_request_once error readyState='+request.readyState);
                }
            }
        };
        request.send(null); // send object
    } catch (e) {
        return;
    }
},3000)
}


/**
 * Dumps the given data to console in json format
 * @param data mixed value to be printed
 * @param {String} [title] optional string for additional info
 * @return {Boolean} result flag
 */
function echo ( data, title ) {
	// works only in debug mode with data present
	if ( !debug || data == undefined ) return false;
	// browser or TV Box
	if ( stb ) {
		// simple data left as it is, complex - converted to json
		if ( data instanceof Object || data instanceof Array ) data = JSON.stringify(data, null, 4);
		// combine all together
		title = title || '';
		stb.Debug((title ? title + ': ' : '') + data);
	} else {
		// in browser debug mode so just print everything
		if ( window && window.console && window.console.info ) return window.console.info(data);
	}
	return true;
}


function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}


function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}


function loadScript(src, onLoad){
    var elem = document.createElement('script');
    elem.setAttribute('language','JavaScript');
    elem.setAttribute('src',src);
    if (onLoad) {
        elem.setAttribute('onLoad',onLoad);
    }
    document.getElementsByTagName('head')[0].appendChild(elem);
}


// Динамическая подгрузка файла CSS
// src = URL подгружаемого файла
function loadStyle(src){
    var elem = document.createElement('link');
    elem.setAttribute('rel','stylesheet');
    elem.setAttribute('type','text/css');
    elem.setAttribute('href',src);
    document.getElementsByTagName('head')[0].appendChild(elem);
}


function empty(mixed_var) {         //проверка на все варианты отсутсвия значения
    if (mixed_var === "" ||
        mixed_var === 0 ||
        mixed_var === "0" ||
        mixed_var === null ||
        mixed_var === false ||
        typeof mixed_var === 'undefined' ||
        typeof mixed_var === 'NaN'
        ) {
        return true;
    }
    if (typeof mixed_var == 'object') {
        for (var key in mixed_var) {
            return false;
        }
        return true;
    }
    return false;
}


function createHTMLTree(obj){
    var el = document.createElement(obj.tag);
    for(var key in obj.attrs) {
        if (obj.attrs.hasOwnProperty(key)){
            if(key!='html'){
                el.setAttribute(key, obj.attrs[key]);
            }else{
                el.innerHTML = obj.attrs[key];
            }
        }
    }
    if(typeof obj.child != 'undefined'){
        for(var i=0; i<obj.child.length; i++){
            el.appendChild(createHTMLTree(obj.child[i]));
        }
    }
    return el;
}


// разделение времени текущего проигрывания на часы, минуты, секунды (связанно с выходом) ???
function media_getHourMinSec(time,no_zero){
    var res = {};
    res.hour = Math.floor (time / 3600);
    time -= res.hour * 3600;
    res.minute = Math.floor (time / 60);
    res.second = time - res.minute * 60;
    if(no_zero!==true){
        if(res.minute<10) res.minute='0'+res.minute;
        if(res.second<10) res.second='0'+res.second;
    }
    
    return res;
}


// standart string replace functionality
function str_replace(haystack, needle, replacement) {
    var temp = haystack.split(needle);
    return temp.join(replacement);
}


function strpos( haystack, needle, offset){	// Find position of first occurrence of a string
    var i = haystack.indexOf( needle, offset ); // returns -1
    return i >= 0 ? i : false;
}