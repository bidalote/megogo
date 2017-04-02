var powerOff = false;

function body_keydown(e){
    log('newAlert_on : '+newAlert_on);    
    var key = e.keyCode || e.which;
    var ret = false;
    if (e.altKey && key == keys.power) {
        if(!powerOff){
            stb.Stop();
            if(CUR_LAYER == layer_player){
                $('cur_time').innerHTML = '';
                $('progress').style.width = 'px';
                $('menu_series').style.display = 'block';
                $('player_page').style.display = 'none';
                $('footer').style.display = 'block';
                currLst = seriesLst;
                PREV_LAYER = layer_player;
                CUR_LAYER = layer_cats;
                currLst.onChange();
                playlist.finish = str_replace(playlist.finish, 'http://megogo.net/b/stat?', '');
                var pos = stb.GetPosTime();
                playlist.finish += pos;
                startPosFromContinue = pos;
                stb.Stop();
                sendreq(megogoURL+'b/stat?'+createSign({
                    'action':'stop', 
                    'video':'2704',
                    'season':'0',
                    'episode':'0',
                    'position':pos
                }),finish);
            }
        }
        powerOff = !powerOff;
        stb.StandBy(powerOff);
        e.preventDefault();
        return;
    }
    if(powerOff){
        e.preventDefault();
        return;
    }
    log('MAIN keyhandler key: '+key+' Alt: '+e.altKey+' Ctrl: '+e.ctrlKey+' Shift: '+e.shiftKey+' Target_id: '+e.target.id)
    if(newAlert_on && key != keys.exit && key != keys.ok){
        return;
    }
    log('+++CURR_LAYER+++'+CUR_LAYER);    
    switch(CUR_LAYER){
        case layer_search:
            ret=searchLineKeyhandler(e);
            break;
        case layer_cats:
            ret=infoPage_keyhandler(e);//catPage_keyhandler(e);
            break;
        case layer_player:
            ret=playerPage_keyhandler(e);
    }
    if(!empty(ret)){
        switch(key){
            default:
                log('+++global handler active+++');
                break;
               case 123:  // web btn
//                stb.Debug("\n<html><head>\n" + document.head.innerHTML + "\n</head>\n<body>\n" + document.body.innerHTML + "</body>\n</html>\n");
               break;
            case keys.vol_up:
                if(vars.player_vars.mute == 1){
                    vars.player_vars.mute = 0;
                    $('mute').style.display = 'none';
                }
                if(vars.player_vars.volume<96){
                    clearTimeout(set_volume);
                    $('volumeForm').style.display = 'block';
                    vars.player_vars.volume += 5;
                    stb.SetVolume(vars.player_vars.volume);
                    $('volume_bar').style.width = vars.player_vars.volume*2+'px';
                    $('volume_num').innerHTML = vars.player_vars.volume+'%';
                    set_volume = window.setTimeout(function(){
                        $('volumeForm').style.display = 'none'
                        },3000)
                }else{
                    clearTimeout(set_volume);
                    $('volumeForm').style.display = 'block';
                    vars.player_vars.volume = 100;
                    stb.SetVolume(vars.player_vars.volume);
                    $('volume_bar').style.width = vars.player_vars.volume*2+'px';
                    $('volume_num').innerHTML = vars.player_vars.volume+'%';
                    set_volume = window.setTimeout(function(){
                        $('volumeForm').style.display = 'none'
                        },3000)
                }
                log('volume'+stb.GetVolume());
                break;
            case keys.vol_down:
                if(vars.player_vars.mute == 1){
                    vars.player_vars.mute = 0;
                    $('mute').style.display = 'none';
                }
                if(vars.player_vars.volume>4){
                    clearTimeout(set_volume);
                    $('volumeForm').style.display = 'block';
                    vars.player_vars.volume -= 5;
                    stb.SetVolume(vars.player_vars.volume);
                    $('volume_bar').style.width = vars.player_vars.volume*2+'px';
                    $('volume_num').innerHTML = vars.player_vars.volume+'%';
                    set_volume = window.setTimeout(function(){
                        $('volumeForm').style.display = 'none'
                        },3000)
                }else{
                    clearTimeout(set_volume);
                    $('volumeForm').style.display = 'block';
                    vars.player_vars.volume = 0;
                    stb.SetVolume(vars.player_vars.volume);
                    $('volume_bar').style.width = vars.player_vars.volume*2+'px';
                    $('volume_num').innerHTML = vars.player_vars.volume+'%';
                    set_volume = window.setTimeout(function(){
                        $('volumeForm').style.display = 'none'
                        },3000)
                }
                log('volume'+stb.GetVolume());
                break;
            case keys.mute:
                if(e.altKey){
                    if(vars.player_vars.mute == 0){
                        vars.player_vars.mute = 1;
                        stb.SetMute(1);
                        $('mute').style.display = 'block';
                    }else{
                        vars.player_vars.mute = 0;
                        stb.SetMute(0);
                        $('mute').style.display = 'none';
                    }
                }
                log('mute'+stb.GetMute());
                break;
        }
    }
}


function playerPage_keyhandler(e){
    var key = e.keyCode || e.which;
    var tmp_video_id='';
    
    log('PLAYER keyhandler key: '+key);
    switch(key){
//        case 121: // phone button
//            log("/11111111111111111111111111111111111111111111111111111111111111111111111/");
//            log("/20000000000000000000000000000000000000000000000000000000000000000000000/");
//            stb.Debug("\n<html><head>\n" + document.head.innerHTML + "\n</head>\n<body>\n" + document.body.innerHTML + "</body>\n</html>\n");
//            break;
        case keys.back:
//            alert('back was pressed');
//            break;
        case keys.stop:
//            stb.Stop();
//            $('cur_time').innerHTML = '';
//            $('progress').style.width = 'px';
//            //switchLayer(PREV_LAYER);
//            $('menu_series').style.display = 'block';
//            $('player_page').style.display = 'none';
//            $('footer').style.display = 'block';
//            currLst = seriesLst;
//            PREV_LAYER = layer_player;
//            CUR_LAYER = layer_cats;
//            currLst.onChange();
//            break;
        case keys.exit:
            $('playAndPause').style.display = 'none';
            echo('trying to clear runner_timer='+runner_timer);
            clearInterval(runner_timer);
            $('cur_time').innerHTML = '';
            $('progress').style.width = 'px';
            $('menu_series').style.display = 'block';
            $('player_page').style.display = 'none';
            $('footer').style.display = 'block';
            if(fileInfo.isSeries){
                tmp_video_id=urlVideo['episode'];
                if($('season_item_1')!=undefined){
                    seasonLst.onChange();
                }
                currLst = episodeLst;
                
            } else {
                currLst = seriesLst;
                tmp_video_id=current_film_id;
            }
            PREV_LAYER = layer_player;
            CUR_LAYER = layer_cats;
            echo('currLst.onChange();');
            currLst.onChange();
            echo('playlist.finish');
            playlist.finish = str_replace(playlist.finish, 'http://megogo.net/b/stat?', '');
            var pos = stb.GetPosTime();
            playlist.finish += pos;
            continue_video_from_pos = pos;
            echo('stb.Stop();');
            stb.Stop();
            sendreq(megogoURL+'b/stat?'+createSign({
                'action':'stop', 
                'video':'2704',
                'season':'0',
                'episode':'0',
                'position':pos
            }),finish);
            
            videosContinueHandler(tmp_video_id,continue_video_from_pos,'add');
//            videofiles_continue_array
            
            
            
            
            break;
        case keys.ok:
            if(!vars.player_shown){
                vars.player_shown = true;
                $('head').style.display = 'block';
                $('player').style.display = 'block';
            }else{
                vars.player_shown = false;
                $('head').style.display = 'none';
                $('player').style.display = 'none';
            }
            break;
        case 66: // кнопка прокрутки влево
        case keys.left:
            if(!vars.player_shown){
                vars.player_shown = true;
                echo('runner_timer cl lf='+runner_timer);
                clearInterval(runner_timer);
                runner_run();
                $('head').style.display = 'block';
                $('player').style.display = 'block';
            }else{
                if(vars.file_curtime>30){
                    clearInterval(runner_timer);
                    clearTimeout(setpos_timer);
                    clearTimeout(pos_timer);
                    if(runFl){
                        vars.file_curtime = stb.GetPosTime();
                        stb.Pause();
                    }
                    runFl = false;
                    vars.file_curtime-=30;
                    var curTime = media_getHourMinSec(vars.file_curtime);
                    $('cur_time').innerHTML = curTime.hour+':'+curTime.minute+':'+curTime.second;
                    log(' vars.file_curtime '+curTime.hour+':'+curTime.minute+':'+curTime.second);
                    $('progress').style.width = vars[win.height].stripe_len*(vars.file_curtime/vars.file_lenght)+'px';
                    stb.SetPosTime(vars.file_curtime);
                    setpos_timer = window.setTimeout(function(){
                        log('stb.Continue');
                        stb.Continue();
                        runFl=1;  
                    },3000);
                }
            }
            break;
        case 70: // кнопка прокрутки вправо
        case keys.right:
            if(!vars.player_shown){
                vars.player_shown = true;
                echo('runner_timer cl right='+runner_timer);
                clearInterval(runner_timer);
                runner_run();
                $('head').style.display = 'block';
                $('player').style.display = 'block';
            }else{
                if(vars.file_curtime<vars.file_lenght-30){
                    clearInterval(runner_timer);
                    clearTimeout(setpos_timer);
                    clearTimeout(pos_timer);
                    if(runFl){
                        vars.file_curtime = stb.GetPosTime();
                        stb.Pause();
                    }
                    runFl = false;
                    vars.file_curtime+=30;
                    var curTime = media_getHourMinSec(vars.file_curtime);
                    $('cur_time').innerHTML = curTime.hour+':'+curTime.minute+':'+curTime.second;
                    log(' vars.file_curtime '+curTime.hour+':'+curTime.minute+':'+curTime.second);
                    $('progress').style.width = vars[win.height].stripe_len*(vars.file_curtime/vars.file_lenght)+'px';
                    stb.SetPosTime(vars.file_curtime);
                    setpos_timer = window.setTimeout(function(){
                        log('stb.Continue');
                        stb.Continue();
                        runFl=1;  
                    },3000);
                }
            }
            break;
        case keys.up:
            break;
        case keys.play_and_pause:
            if(stb.IsPlaying()){
                $('btn_play').style.background = 'url(img/'+win.height+'/btn_pause.png)';
                stb.Pause();
                $('playAndPause').style.display = 'block';
            }else{
                $('btn_play').style.background = 'url(img/'+win.height+'/btn_play.png)';
                stb.Continue();
                $('playAndPause').style.display = 'none';
            }
            break;
        case keys.vol_down:
            return true;
            break;
        case keys.vol_up:
            return true;
            break;
        case keys.frame:  // кнопка FRAME - пропорции видеоизображения
            if(aspectTimer) {
                clearTimeout(aspectTimer);
            }
            aspectTimer = null;
            vars.player_vars.aspect_current = (vars.player_vars.aspect_current + 1) % 4;
            stb.SetAspect(vars.player_vars.aspects[vars.player_vars.aspect_current].mode);
            $('screenAspect').style.backgroundImage = 'url(' + vars.player_vars.aspects[vars.player_vars.aspect_current].img + ')';
            $('screenAspect').style.display = 'block';
            aspectTimer = setTimeout(function() {
                $('screenAspect').style.display = 'none';
            }, 3000);
            break;
        case keys.mute:
            return true;
            break;
    }
    return true;
}


function infoPage_keyhandler(e){
    var key = e.keyCode || e.which;
    log('INFO keyhandler key: '+key);
    switch(key){
        case 121: // phone button
            log("/11111111111111111111111111111111111111111111111111111111111111111111111/");
            log("/20000000000000000000000000000000000000000000000000000000000000000000000/");
               stb.Debug("\n<html><head>\n" + document.head.innerHTML + "\n</head>\n<body>\n" + document.body.innerHTML + "</body>\n</html>\n");
            break;
        case keys.ok:
            currLst.onEnter();
            break;
        case 33: // page_up button
            if(currLst == movieInfoLst || currLst == actorsMovieLst || currLst == commentsMovieLst || currLst == subCatLst)
                currLst.onPageUp();
            if(currLst == searchResultLst || currLst == extSubCatLst) currLst.onPageUp();
            break;
        case 34: // page_down button
            if(currLst == movieInfoLst || currLst == actorsMovieLst || currLst == commentsMovieLst || currLst == subCatLst)
                currLst.onPageDown();
            if(currLst == searchResultLst || currLst == extSubCatLst) currLst.onPageDown();
            break;
        case keys.up:
            if(typeof currLst.onUp == 'function')
                currLst.onUp();
            else currLst.prev();
            break;
        case keys.down:
            if(typeof currLst.onDown == 'function')
                currLst.onDown();
            else currLst.next();
            break;
        case keys.left:
            startPosFromContinue = 0;
            if(typeof currLst.onLeft == 'function')
                currLst.onLeft();
            else currLst.onExit();
            break;
        case keys.right:
            if(typeof currLst.onRight == 'function')
                currLst.onRight();
            else currLst.onEnter();
            break;
        case keys.vol_down:
            return true;
            break;
        case keys.vol_up:
            return true;
            break;
        case keys.mute:
            return true;
            break;
        case keys.back:
            startPosFromContinue = 0;
            if( currLst.onRefresh instanceof Function ) {
                currLst.onRefresh();
                e.preventDefault();
            }
            else  currLst.onExit();
            break;
        case keys.exit:
            if(typeof currLst.onExit == 'function')
                startPosFromContinue = 0;
            currLst.onExit();
            break;
        case keys.red:
            if(currLst == extSubCatLst){
                sort = 'year';
                currLst = genreLst;
                currLst.onEnter();
            }
            break;
        case keys.green:
            if(currLst == extSubCatLst){
                sort = 'popular';
                currLst = genreLst;
                currLst.onEnter();
            }
            break;
        case keys.yellow:
            if(currLst == extSubCatLst){
                sort = 'rate';
                currLst = genreLst;
                currLst.onEnter();
            }
            break;
        case keys.blue:
            if(currLst == extSubCatLst){
                sort = 'add';
                currLst = genreLst;
                currLst.onEnter();
            }
            break;
    }
}


var input_timer = null;
function searchLineKeyhandler(e){
        var key = e.keyCode || e.which;
    log('search Line Keyhandler key: '+key);
    switch(key){
//        case 121: // phone button
//            log("/11111111111111111111111111111111111111111111111111111111111111111111111/");
//            log("/20000000000000000000000000000000000000000000000000000000000000000000000/");
////               stb.Debug("\n<html><head>\n" + document.head.innerHTML + "\n</head>\n<body>\n" + document.body.innerHTML + "</body>\n</html>\n");
//            break;
        case keys.ok:
            currLst.onEnter();
            break;
        case keys.up:
            if(currLst == suggestLst){echo('suggestLst lst up');suggestLst.onUp();}
            else {echo('search lst up');searchLst.onUp();}
            e.preventDefault();
            break;
        case keys.down:
            if(currLst == suggestLst) {currLst.onDown();} 
//            else  {suggestLst.onDown();}
//            e.preventDefault();
            break;
        case keys.left:
            return true;
            break;
        case keys.right:
            return true;
            break;
        case keys.vol_down:
            return true;
            break;
        case keys.vol_up:
            return true;
            break;
        case keys.mute:
            return true;
            break;
        case keys.back:
            echo('back key');
            if ( input_timer ) {clearTimeout(input_timer);}
            echo('timer is working now -> 2 sec to start');
            input_timer = setTimeout(suggestLst.reset, 2000); 
            break;
        case keys.exit:
            currLst.onExit();
            break;
        default:
            if(currLst !== suggestLst)
            {echo('default conditionf for search keyhandler');
            if ( input_timer ) clearTimeout(input_timer);
            input_timer = setTimeout(suggestLst.reset, 2000);} 
            break;
    }
    
}