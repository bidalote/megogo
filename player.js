var startPosFromContinue = 0;

function eventFunc(event){
    event = parseInt(event);
    echo('_________video_event__'+event);
    switch(event){
        
        // Плеер достиг окончания медиа контента или зафиксировал длительный разрыв потока.
        case 1:
            // обрыв видео
            if(vars.file_curtime<vars.file_lenght-10 && connection_for_playlist_try<3){
                connection_for_playlist_try++;
                continue_video_from_pos=vars.file_curtime;
                echo('connection has been lost, redirecting to new server, connection try='+connection_for_playlist_try);
                if(fileInfo.isSeries){
                    echo('this is series, not film');
                    season = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].id;
                    echo('starting new video');
                    echo('seasonLst.season_number='+seasonLst.season_number);
                    echo('episodeLst.episode_number='+episodeLst.episode_number);
                    urlVideo['episode'] = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id;
                    urlVideo['season'] = season;
                    // берем качество из памяти приставки(энергонезависимой) либо из главного меню
                    if(accpass.quality!=='auto'){
                        urlVideo['bitrate']=accpass.quality;
                    }
                    // либо из личного выбора в меню "паузы" или "информации о фильме"
                    if(current_video_quality!=''){
                        urlVideo['bitrate']=current_video_quality;
                    }
                    echo("accpass.quality= current_video_quality="+accpass.quality+' '+current_video_quality);
                    sendreq(iviURL+'info?'+createSign(urlVideo),start_playing1);
                    return;
                } else {
                    echo('runner_timer film end='+runner_timer);
                    clearInterval(runner_timer);
                    
                    // берем качество из памяти приставки(энергонезависимой) либо из главного меню
                    if(accpass.quality!=='auto'){
                        urlVideo['bitrate']=accpass.quality;
                    }
                    // либо из личного выбора в меню "паузы" или "информации о фильме"
                    if(current_video_quality!=''){
                        urlVideo['bitrate']=current_video_quality;
                    }
                    echo("accpass.quality= current_video_quality="+accpass.quality+' '+current_video_quality);
                    urlVideo['video']=current_film_id;
                    
                    sendreq(iviURL+'info?'+createSign(urlVideo),start_playing1);

                }
            }else{
                // нормальное завершене видео
                connection_for_playlist_try=0;
                echo('normal video end, connection try='+connection_for_playlist_try);
                if(fileInfo.isSeries){
                    echo('this is series, not film');
                    season = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].id;
                
                    for(var i=0;i<seasonLst.SeasonsAndEpisodesArr[0].episode_list.length;i++){
                        echo('file.video[0].season_list[0].episode_list[i].title='+seasonLst.SeasonsAndEpisodesArr[0].episode_list[i].title);
                        echo('file.video[0].season_list[0].episode_list[i].id='+seasonLst.SeasonsAndEpisodesArr[0].episode_list[i].id);
                    }
                    echo('seasonLst.season_number='+seasonLst.season_number);
                    echo('episodeLst.episode_number='+episodeLst.episode_number);
                    echo('episodeLst.episode_number+1='+(episodeLst.episode_number+1));

                    if(seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[(episodeLst.episode_number+1)]==undefined && seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number+1]==undefined){
                        echo('this is last season and last episode');
                        $('menu_series').style.display = 'block';
                        $('player_page').style.display = 'none';
                        $('footer').style.display = 'block';
                        if($('season_item_1')!=undefined){
                            seasonLst.onChange();
                        }
                        currLst = episodeLst;
                        PREV_LAYER = layer_player;
                        CUR_LAYER = layer_cats;
                        currLst.onChange();
                        
                        echo('runner_timer season and series='+runner_timer);
                        clearInterval(runner_timer);
                        return;
                    }
        
                    echo('this isnt end for this serials');
                    if(!empty(seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[(episodeLst.episode_number+1)])){
                        echo('it is new episode->');
                        episodeLst.pos++;
                        if(episodeLst.pos==vars[win.height].seriesLen){
                            episodeLst.pos=0;
                            episodeLst.page++;
                        }
                        episodeLst.episode_number++;
                        echo('new episode number is '+episodeLst.episode_number);
                    }
                    else{
                        if(!empty(seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number+1].episode_list[0].id)){
                            echo('it is new season->');
                            seasonLst.next();
                            echo('new season number is '+seasonLst.season_number);
                            episodeLst.episode_number=0;
                            episodeLst.pos=0;
                            episodeLst.page=0;
                            season = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].id;
                            echo('season='+season);
                            initSeriesLst(seasonLst.pos, 0);
                        }
                    }
                    echo('starting new video');
                    echo('seasonLst.season_number='+seasonLst.season_number);
                    echo('episodeLst.episode_number='+episodeLst.episode_number);
                    urlVideo['episode'] = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id;
                    urlVideo['season'] = season;
                    // берем качество из памяти приставки(энергонезависимой) либо из главного меню
                    if(accpass.quality!=='auto'){
                        urlVideo['bitrate']=accpass.quality;
                    }
                    // либо из личного выбора в меню "паузы" или "информации о фильме"
                    if(current_video_quality!=''){
                        urlVideo['bitrate']=current_video_quality;
                    }
                    echo("accpass.quality= current_video_quality="+accpass.quality+' '+current_video_quality);
                    sendreq(iviURL+'info?'+createSign(urlVideo),start_playing1);
                    return;
                } else {
                    echo('runner_timer film end='+runner_timer);
                    clearInterval(runner_timer);
                    currLst = seriesLst;
                    $('menu_series').style.display = 'block';
                    $('player_page').style.display = 'none';
                    $('footer').style.display = 'block';
                    currLst = seriesLst;
                    PREV_LAYER = layer_player;
                    CUR_LAYER = layer_cats;
                    currLst.onChange();
                    currLst.reset();
                }
            }
            break;
        // Получена информация о аудио и видео дорожках медиа контента.    
        case 2:
            vars.file_lenght = stb.GetMediaLen();
            vars.file_percent = stb.GetPosPercentEx();
            vars.file_curtime = stb.GetPosTime();
            echo('video total time (by stb.GetMediaLen()) is='+stb.GetMediaLen());
            echo('video current time (by stb.GetPosTime()) is='+stb.GetPosTime());
                        
            var curTime = media_getHourMinSec(vars.file_curtime);
            var totalTime = media_getHourMinSec(vars.file_lenght);
            $('cur_time').innerHTML = curTime.hour+':'+curTime.minute+':'+curTime.second;
            $('total_time').innerHTML = totalTime.hour+':'+totalTime.minute+':'+totalTime.second;
            $('progress').style.width = vars[win.height].stripe_len*vars.file_percent/10000+'px';
            break;
        // Начало отображаться видео и/или воспроизводиться звук.     
        case 4:
            if(continue_reset_flag===true){ // единожды проверяем на наличие точки продолжения в массиве продолжений
                var result=0;
                if(fileInfo.isSeries){
                    result=videosContinueHandler(urlVideo['episode'],0,'look_for');    
                } else {
                    result=videosContinueHandler(current_film_id,0,'look_for');  
                }
                if(result>0){
                    echo('continuing from='+result);
                    stb.SetPosTime(result);
                    result=0;
                }
                continue_reset_flag=false;
            }
            runFl = true;
            echo('runner_timer clear at 4 event='+runner_timer);
            clearInterval(runner_timer);
            runner_run();
            break;
        // Ошибка открытия контента: нет такого контента на сервере или произошёл отказ при соединении с сервером.    
        case 5:
            break;
        // 7 Получена информация о видео контенте.    
    }
}


//function finish(text){
//}

function runner_run(){
    runner_timer = window.setInterval(function(){
        echo('r_timer='+runner_timer);
        if(runFl) {
            vars.file_percent = stb.GetPosPercentEx();
            vars.file_curtime = stb.GetPosTime();
            echo('video current time (now) is='+vars.file_curtime);
            var curTime = media_getHourMinSec(vars.file_curtime);
            $('cur_time').innerHTML = curTime.hour+':'+curTime.minute+':'+curTime.second;
            $('progress').style.width = vars[win.height].stripe_len*vars.file_percent/10000+'px';
        }
    },1000);
}