stb_emul_mode = 1;


/**
 * инициализация программы
 */
function init(){
    back_location = back_location.replace(/\?referrer\=/, '');
    window.moveTo(0, 0);
    window.resizeTo(win.width, win.height);
    loadStyle(win.height+'.css');
// На текущий момент их сервер не до конца поддерживает многоязычность, но ведутся работы над решением. 
// Закомментированно до завершения работ.    
//    var lang = stb.RDir('getenv language');  
//    if(lang != "ru"){lang="en";}
    lang = "ru";
    loadScript(lang+'.js','scriptloaded()'); 
    stb.InitPlayer();
    stb.SetTopWin(0);
    stb.EnableServiceButton(true);
    stb.EnableVKButton(true);
    vars.player_vars.volume = stb.GetVolume();
    vars.player_vars.mute = stb.GetMute();
    device = stb.RDir("Model");
    stb.SetPIG (1,0,0,0);
    stbEvent = {
        onEvent:eventFunc,
        event: 0
    };
    // выбор размерностей меню в зависимости от разрешения
    genreLst.maxLength = vars[win.height].seriesLen;
    cont_page_max = vars[win.height].cont_page_x_max*vars[win.height].cont_page_y_max;
    extSubCatLst.length = searchResultLst.length = vars[win.height].ext_cont_page_x_max;
    extSubCatLst.maxLength = searchResultLst.maxLength = vars[win.height].ext_cont_page_x_max;
    echo('init finished');
}


/**
 * продолжение инициализации после загрузки языкового файла
 */
function scriptloaded(){
//    echo('langs='+langs);
    // выбор языка - переименование элементов по их id
    var domel = null;
    // iterate all localizated lines
    for ( var id in langs ) {
        // find corresponding html elements
        domel = document.getElementById(id);
        // and update if exists
        if ( domel ) domel.innerHTML = langs[id];
    }
    
    // после выбора языка загружаем а после - показываем главное меню
   sendreq(iviURL+'categories?&'+createSign({'lang':lang}), drow_cats); 
   
    // переименование элементов в соотв с языком (особые случаи)
    $('confirmExit').getElementsByClassName('modal_box')[0].innerHTML = exit_confirm_mes+$('confirmExit').getElementsByClassName('modal_box')[0].innerHTML;
    $("series_0").innerHTML = lang_series_0+'<div class="menu_continue"></div>';
    $("series_1").innerHTML = lang_series_1+'<div class="menu_season"></div>';
    $("series_2").innerHTML = lang_series_2+'<div class="menu_quality"></div>';
    $("series_3").innerHTML = lang_series_3+'<div class="menu_anew"></div>';
    $("director_id").innerHTML = lang_director+'<div class="movieinfo_cast_actor"></div>';
    $("lang_genre").innerHTML = lang_genre+'<div class="movieinfo_cast_actor" id="movie_info_genre_id"></div>';
    $("lang_rating").innerHTML = lang_rating+'<div class="movieinfo_cast_rating" id="movieinfo_cast_rating"></div>';

    // подгрузка логина, пароля и качества из файла
    var accpass_str = stb.LoadUserData('megogofile');
    // получение сесси по сохраненному в пост. памяти логину и паролю
    if(empty(accpass_str))
        accpass ={
            'login':'', 
            'pass':'',
            'quality':''
        };
    else{
        accpass = JSON.parse(accpass_str);
        if(!empty(accpass.login)){
            echo("jpass is  = "+accpass.pass+" and jlogin is = "+accpass.login+" and jquality is ="+accpass.quality);
            sendreq(iviURL+'login?'+createSign({
                'login':accpass.login, 
                'pwd': b64_to_utf8(accpass.pass)
            }),drowheader);
        }
    }
}


/**
 * создание/очистка меню избранное/похожие/рекомендуем
 * так же используется внутри initVerticalList()
 * @param layer текущий слой
 * @param count количество фильмов помещающееся на 1 экран
 */
function init_pages(layer, count){
    echo('init_pages(layer, count) count='+count+' cont_page_max='+cont_page_max);
    var arr = $(layer+'video_layer');
    while(arr.children.length)
        arr.removeChild(arr.children[0]);
    if(empty(count))
        count = cont_page_max+1;
    if(count==undefined)
        count = cont_page_max+1;
    if(count>cont_page_max+1)
        count = cont_page_max;
    for(var y = 0;y<count;y++){
        var obj = {
            'tag':'div',
            'attrs':{
                'id':layer+'video_p'+y,
                'class':'submenu_item'
            },
            'child':[
            {
                'tag':'div',
                'attrs':{
                    'class':'submenu_cover'
                }
            },
            {
                'tag':'div',
                'attrs':{
                    'class':'submenu_title'
                }
            },

            {
                'tag':'div',
                'attrs':{
                    'class':'submenu_text'
                }
            },

            {
                'tag':'div',
                'attrs':{
                    'class':'submenu_rating'
                }
            }
            ]
        }
        $(layer+'video_layer').appendChild(createHTMLTree(obj));
    }
    echo('$(layer+video_layer).innerHTML='+$(layer+'video_layer').innerHTML); 
    $('submenu').style.display = 'block';
    currLst.onChange();
}


/**
 * проверяемм введенные данные авторизации и если 
 * мы залогиниваемся и данные правильные - сохраняем их а поля ввода 
 * парoля и логина меняем на строки
 * @param {String} text ответ от сервера на посланные авторизационные данные
 */
function drowheader(text){
    var authData = JSON.parse(text);
    if(authData.error){
        currLst = authLst;
        currLst.reset();
            prevLst=authLst;
            currLst=modalLst;
            show_auth_request(lang_auth_error);
    }
    else{
        session = authData.session;
        for(var i in authData.user.favorites)
            favorites[authData.user.favorites[i]] = 1;
        if(!accpass.quality) accpass.quality='';
        if(currLst==authLst) {
            echo("data saving login = "+$('login').value+' pass = '+utf8_to_b64($('password').value)+' quality = '+accpass.quality);
            stb.SaveUserData('megogofile','{"login":"'+$('login').value+'","pass":"'+utf8_to_b64($('password').value)+'","quality":"'+accpass.quality+'"}')
     
            accpass.login=$('login').value;
            accpass.pass=$('password').value;
            $('submenugenres_title_0').innerHTML = accpass.login;
            $('submenugenres_title_1').innerHTML = '************';
            $('submenugenres_title_2').innerHTML = auth_btn_logout;
        }       
    }
}


/**
 * заполнение главного меню данными
 * @param responseCats данные от сервера (список категорий)
 */
function drow_cats(responseCats){
    if(responseCats != undefined){
        cats_obj = JSON.parse(responseCats);
        echo(cats_obj);
    }
    else
    { // на тот случай если сервер умер но как минимум начальную страницу показать нужно
        cats_obj = {
            "result":"ok",
            "category_list":[{
                "id":"16",
                "title":"\u0424\u0438\u043b\u044c\u043c\u044b",
                "total_num":"2829"
            },{
                "id":"4",
                "title":"\u0421\u0435\u0440\u0438\u0430\u043b\u044b",
                "total_num":"444"
            },{
                "id":"6",
                "title":"\u041c\u0443\u043b\u044c\u0442\u0444\u0438\u043b\u044c\u043c\u044b",
                "total_num":"398"
            },{
                "id":"9",
                "title":"\u041f\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u0438 \u0448\u043e\u0443",
                "total_num":"70"
            },{
                "id":"17",
                "title":"\u041d\u043e\u0432\u043e\u0441\u0442\u0438",
                "total_num":"96"
            }]
        };
        echo('empty ansver from server for category request');
    }

    var html_code_begin = '<div id="cat_0" title="topmenu"></div>'; // рекомендуемы фильмы
    var html_code_center="";
    var cat_id_number=1;
    for(var i = 0;i < cats_obj.category_list.length;i++){
        if(cats_obj.category_list[i].total_num>0){
            html_code_center+='<div id="cat_'+cat_id_number+'" title="topmenu" class="cat_item_text '+main_menu_item_colors[i]+'">'+cats_obj.category_list[i].title+'</div>';
            cat_id_number++;
            // заполняем массив id-шников чтобы потом по ним слать запросы на получение жанров
            vars.catID.push(cats_obj.category_list[i].id);
            echo("vars.catID.push(cats_obj.category_list.id) == "+vars.catID);
        }
    }
    //  cat_id_number;
    var html_code_end = '<div id="cat_'+(cat_id_number)+'" title="topmenu" class="cat_item_text '+main_menu_item_colors[cat_id_number]+'">'+lang_favourite+'</div>';
    $('main_menu_item_list').innerHTML=(html_code_begin+html_code_center+html_code_end);
    // а теперь изменим id у поиска и у меню настроек, и цвет их подменю - т.к. они всегда будут последними в списке id-ов
    cat_id_number++;
    $('cat_searh').id = 'cat_'+cat_id_number;
    colors[cat_id_number]= 'blue';
    cat_id_number++;
    $('cat_service').id = 'cat_'+cat_id_number;
    colors[cat_id_number]= 'blue';
    // прячем пункты которые не вмещаются в меню
    for(var n = 5; n<(cat_id_number-1);n++ ){
        $("cat_"+n).style.display = "none";
    }
    // перекл слой
    catLst.length=(cat_id_number+1);
    switchLayer(layer_cats);
    pop_layer = true;
    // подгрузка и показывание избранного на старте с помощью метода меню
    if(loading_status=='first_loading'){
        catLst.pos='';
        catLst.onEnter();
    }
    // показываем полностью весь зкран (т.е. отключаем окно первичной загрузки)
    echo("$('body').style.display='block';");
    $('body').style.display='block';
}


/**
 * подгтовка к запуску видео в плеере по его id
 * @param id id_фильма
 */
function sesies_getdata(id){
    continue_reset_flag=true;
    current_film_id=id;
    urlVideo = {
        'video':id, 
        'session':session
    }
    if(fileInfo.isSeries){
        season = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].id;
        if(!empty(seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number])){
            urlVideo['episode'] = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id;
            urlVideo['season'] = season;
            echo('urlVideo[id]='+id+' urlVideo[season] ='+season+' urlVideo[episode] ='+seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id);
        }
    }
    // берем качество из памяти приставки(энергонезависимой) либо из главного меню
    if(accpass.quality!=='auto'){urlVideo['bitrate']=accpass.quality;}
     
    // либо из личного выбора в меню "паузы" или "информации о фильме"
    if(current_video_quality!=''){urlVideo['bitrate']=current_video_quality;}
    echo("accpass.quality= current_video_quality="+accpass.quality+' '+current_video_quality);
    sendreq(iviURL+'info?'+createSign(urlVideo),start_playing1);
}


/**
 * обработка данных меню жанров
 * @param cat выбранная категория
 * @param page выбранная страница
 */
function initGenriesPage(cat, page){
    var lst    = genreList[cat],
        tmpLst = [],
        arr    = $('genres_id'),
        style_attribute;
    // жанр "все"
    lst[0] = {
        'id':'0',
        'title':lang_genre_name_all
    };
     
    genre_list_length=lst.length;
    
    while(arr.childElementCount>1){
        arr.removeChild(arr.children[1]);
    }
    genreLst.id = new Array();
    
    for(var i=0; i< lst.length; i++){    
        tmpLst.push(lst[i].id);

        if(i<9)style_attribute='block'; 
        else style_attribute='none';
        var obj = {
            'tag':'div',
            'attrs':
            {
                'class':'submenu_genres_item',
                'id': 'genres_item_'+i,
                'style': 'display :'+style_attribute
            },
            'child':
            [
            {
                'tag':'div',
                'attrs':
                {
                    'class':'submenugenres_title',
                    'html':lst[i].title
                }
            }
            ]
        }
        $('genres_id').appendChild(createHTMLTree(obj));
        genreLst.id.push(i);
        genreLst.length++;
    }
}


/**
 * предварительная обработка данных меню жанров
 * @param text список жанров полученный от сервера
 */
function init_genreLst(text){
    var clean_genre_list = [];
    genreListTmp = JSON.parse(text);
    if(genreListTmp.genre_list != undefined)
        genreListTmp = genreListTmp.genre_list;
    else echo('init_genreLst(undefined)! -> genre list from server is empty!');
    cat = vars.catID[catLst.pos];
    var j=1; // 1 так как нулевая - это жанр "все"
    for(var i=0;i<genreListTmp.length;i++){
        if(genreListTmp[i].total_num>0){
            clean_genre_list[j] = genreListTmp[i];
            j++;
        }
    }

    genreList[cat] = clean_genre_list;
    initGenriesPage(cat, 0);
    currLst = genreLst;
    currLst.reset();
    $('genres_item_'+genreLst.id[genreLst.pos]).className ="submenu_genres_item";
    currLst.onChange();
    $('submenu_genres').style.display = 'block';
}


/**
 * заполнить рейтинг (звездочки)
 * @param ds текущий фильм
 * @return {String} res html-код для вставки
 */
function getHTMLRating(ds){
    var res = '';
    res+='<div class="stripes_horizontal_country">';
    var generalRate = 0;
    if(ds.rating_kinopoisk)
        generalRate = parseFloat(ds.rating_kinopoisk);
    generalRate = generalRate.toFixed(2);
    if(win.height == 576)
        res += '<div class="submenu_genre_rating">';
    else
        res += '<div class="submenu_rating">'
    echo('generalRate*vars[win.height].rating_length='+generalRate+'*'+vars[win.height].rating_length);
    res += '<div class="stripes_genres_horizontal_rating"><div class="stripes_genres_horizontal_rating_act" style="width: '+(generalRate*vars[win.height].rating_length+1)+'px; "></div></div>';
    res +='</div>';
    if(ds.year != undefined)
        res += ds.year;
    if(!empty(ds.country)){
        if(!empty(ds.year))
            res +=', ';
        if(!empty(countries[ds.country]))
            res += countries[ds.country];
        else res += ds.country;
    }
    res += '</div>';
    return res;
}


/**
 * заполнение страницы каталога или поиска фильмами (постерами и краткой информацией)
 * @param list весь список фильмов
 * @param offset текущее положение в списке
 * @param limit количество фильмов о которых пришла информация с сервера (обычно грузится по 10 или 6 фильмов)
 */
function initHorizontalList(list, offset, limit){
    echo('initHorizontalList(list,offset='+offset+' limit='+limit);
    layer = 'ext_';
    var i,  
    extCatLst_x_length = vars[win.height].ext_cont_page_x_max,
    counter=0,
    tmpFields = '',
    tmp_poster_width,
    tmp_poster_height;
     
    tmpFields += '<div class="stripehorizontal_counter" id="stripehorizontal_counter">';
    tmpFields += (offset+currLst.pos+1)+lang_extSubCatLst_counter+video_files_total_num;
    tmpFields += '<div class="stripehorizontal_counter_bottom"></div></div>';
    echo('offset+this.pos= '+offset+' & '+currLst.pos);
     
    for(i = offset; i<offset+extCatLst_x_length; i++){
        if(i>=video_files_total_num)
            break;
        echo('main_video_files_list[i].id at initHorizontalList() i='+i);
        echo('main_video_files_list[i].id at initHorizontalList()='+main_video_files_list[i].id+' i='+i);
        tmpFields += '<div class="stripes_horizontal_box" id="'+layer+'video_p'+counter+'"><div class="';
        if(!this_is_news_cat){
            tmpFields += 'stripes_cover">';
        }else{
            tmpFields += 'news_stripes_cover">';
        }
        if(main_video_files_list[i].poster != undefined){
            if(this_is_news_cat){
                tmp_poster_width=vars[win.height].poster_height;
            }else{
                tmp_poster_width=vars[win.height].poster_width;
            }
            tmpFields += '<img src="'+'http://megogo.net'+main_video_files_list[i].poster+'" width="'+tmp_poster_width+'" height="'+vars[win.height].poster_height+'"/></div>';
        }
        tmpFields += '<div class="stripes_horizontal_title">'+main_video_files_list[i].title+'</div>';
        if(!this_is_news_cat){
            tmpFields+=getHTMLRating(main_video_files_list[i]);
        }
        tmpFields += '</div>';
        counter++;
    }

    $(layer+'video_layer_0').innerHTML = tmpFields;
    tmpFields = '';

    tmpFields += '<div class="stripeshorizontal_left" id="extSubCat_left_arr" '
    if(currLst.page==0) tmpFields += 'style="background: none;"';
    tmpFields += '></div>'

    for(i=offset+extCatLst_x_length;i<offset+(extCatLst_x_length*2);i++){
        if(i>=video_files_total_num)
            break;
        tmpFields += '<div class="stripes_horizontal_box" id="'+layer+'video_p'+counter+'"><div class="';
        if(!this_is_news_cat){
            tmpFields += 'stripes_cover">';
        }else{
            tmpFields += 'news_stripes_cover">';
        }
        if(main_video_files_list[i].poster != undefined){
            if(this_is_news_cat){
                tmp_poster_width=vars[win.height].poster_height;
            }else{
                tmp_poster_width=vars[win.height].poster_width;
            }
            tmpFields += '<img src="'+'http://megogo.net'+main_video_files_list[i].poster+'" width="'+tmp_poster_width+'" height="'+vars[win.height].poster_height+'"/></div>';}
        tmpFields += '<div class="stripes_horizontal_title">'+main_video_files_list[i].title+'</div>';
        if(!this_is_news_cat){tmpFields+=getHTMLRating(main_video_files_list[i]);}
        tmpFields += '</div>';
        counter++;
    }
    tmpFields += '<div class="stripeshorizontal_right" id="extSubCat_right_arr" '; 
    if(extCatLst_x_length*2 > video_files_total_num-(currLst.page*extCatLst_x_length*2)) tmpFields += 'style="background: none;"';
    tmpFields += '></div>';
    
    $(layer+'video_layer').innerHTML = tmpFields;
    $(layer+'video_layer_2').style.display = 'none';
}


/**
 * обработка данных и заполнение страницы для категорий "избранное", "рекомендуемоt" и "похожие фильмы"
 * @param ds1 обработанные данные из init_contentlist (т.е. список фильмов)
 * @param layer current layer
 */
function fill_contentlist(ds1, layer){
    echo('fill_contentlist(ds1, layer) ds1='+ds1);
    var lst = subCatLst;
    if(currLst == movieInfoLst)
        lst = proposalMovieLst;
    lst.length = 0;

    var start = (subCatLst.page-subCatLst.dsPos)*cont_page_max;
    echo('start='+start);
    var ds = ds1.slice(start, start+(cont_page_max+1));

    for(var i = 0;i<=cont_page_max;i++){
        if(ds[i]){
            lst.length++;
            $(layer+'video_p'+i).style.display = 'block';
            if(ds[i].poster){
                $(layer+'video_p'+i).getElementsByClassName('submenu_cover')[0].innerHTML = '<img src="'+'http://megogo.net'+ds[i].poster+'" width="'+vars[win.height].poster_width+'" height="'+vars[win.height].poster_height+'" align="left"  style="margin-right:2px;"/>';
            }
            else $(layer+'video_p'+i).getElementsByClassName('submenu_cover')[0].innerHTML = '';
            $(layer+'video_p'+i).getElementsByClassName('submenu_title')[0].innerHTML = ds[i].title;
            if(ds[i].year != undefined){
                $(layer+'video_p'+i).getElementsByClassName('submenu_text')[0].innerHTML = ds[i].year;
            }
            if(!empty(ds[i].country)){
                if(!empty(ds[i].year))
                    $(layer+'video_p'+i).getElementsByClassName('submenu_text')[0].innerHTML +=', ';
                if(!empty(countries[ds[i].country]))
                    $(layer+'video_p'+i).getElementsByClassName('submenu_text')[0].innerHTML += countries[ds[i].country];
                else $(layer+'video_p'+i).getElementsByClassName('submenu_text')[0].innerHTML += ds[i].country;
            }
            try{
                for(var y = 0;y<ds[i].genre_list.length;y++){
                    $(layer+'video_p'+i).getElementsByClassName('submenu_text')[0].innerHTML +=', '+ds[i].genre_list[y]['title']
                }
            } catch(e) {}
            generalRate = 0;
            if(ds[i].rating_kinopoisk)
                generalRate = parseFloat(ds[i].rating_kinopoisk);
            else
            if(ds[i].rating_imdb)
                generalRate = parseFloat(ds[i].rating_imdb);
            generalRate = generalRate.toFixed(2);
            rate = '';
            rate='<div class="stripes_horizontal_rating"><div class="stripes_horizontal_rating_act"></div>'+generalRate+'</div></div>';
            var arr = $(layer+'video_p'+i).getElementsByClassName('submenu_rating')[0].innerHTML = rate;
            $(layer+'video_p'+i).getElementsByClassName('submenu_rating')[0].getElementsByClassName('stripes_horizontal_rating_act')[0].style.width = generalRate*10+'px';
        }else{
            $(layer+'video_p'+i).style.display = 'none';
        }
    }
    window.setTimeout(function(){
        $(sub_layers[SUB_CUR_LAYER]).style.display = 'none';
        $(sub_layers[sub_layer_video]).style.display = 'block';
        SUB_CUR_LAYER = sub_layer_video;
    },180);
    if(layer == 'alt_')
        proposalMovieLst.dataset = ds;
    else dataset = ds;
}


/**
 * предварительная обработка данных для категорий "избранное", "рекомендуемоt" и "похожие фильмы"
 * @param text server response
 * @param layer current layer
 */
function init_contentlist(text, layer){
    echo('init_contentlist(text, layer) text='+text);
    var ds;
    if(layer==undefined)
        layer = '';
    if(typeof(text) != 'object')
        ds = JSON.parse(text);
    else ds = text;
    if(ds.video_list != undefined){
        ds = ds.video_list;
        if(empty(ds) && catLst.pos == (catLst.length-3) && (currLst==subCatLst)){
            if (currLst.page==0){
                $('video_layer').style.display = "none";
                currLst = catLst;
                if(currLst.prevPos<currLst.pos)
                    currLst.prev();
                else currLst.next();
            }
            else currLst.prev();
            echo('ds is empty');
            return;
        }
        echo('movie_proposal->init_content_list->init_pages ds.video_list='+ds.video_list);
        init_pages(layer,ds.video_list);
    }
    echo('point TWO');
    subCatLst.dsPos = subCatLst.page;
    fill_contentlist(ds, layer);
    echo('currLst at point TWO is '+currLst.name);
    currLst.ds = ds;
}



/**
 * заполнение страницы рекомендуемое/избранное/похожее фильмами (постерами и краткой информацией)
 * @param input_videolist весь список фильмов
 * @param offset текущее положение в списке
 * @param page_length количество фильмов о на страницу
 * @param layer флаг между "похожие" и "избранные/рекомендуемые"
 */
function initVerticalList(input_videolist, offset, page_length, layer){
    echo('initVerticalList');
    echo('offset='+offset);
    echo("page_length="+page_length);
    echo('input_videolist[]='+input_videolist);
    // предварительно очищаем старые записи и готовим структуру под новые
    var init_num_page=4;
    if(video_files_total_num-offset<4){
        init_num_page=video_files_total_num%3;
    }
    
    init_pages(layer, init_num_page);
    
    for(var i = offset, j=0; i<offset+4; i++, j++){
        if(input_videolist[i]){
            $(layer+'video_p'+j).style.display = 'block';
            if(input_videolist[i].poster){
                $(layer+'video_p'+j).getElementsByClassName('submenu_cover')[0].innerHTML = '<img src="'+'http://megogo.net'+input_videolist[i].poster+'" width="'+vars[win.height].poster_width+'" height="'+vars[win.height].poster_height+'" align="left"  style="margin-right:2px;"/>';
            }
            else $(layer+'video_p'+j).getElementsByClassName('submenu_cover')[0].innerHTML = '';
            $(layer+'video_p'+j).getElementsByClassName('submenu_title')[0].innerHTML = input_videolist[i].title;
            if(input_videolist[i].year != undefined){
                $(layer+'video_p'+j).getElementsByClassName('submenu_text')[0].innerHTML = input_videolist[i].year;
            }
            if(!empty(input_videolist[i].country)){
                if(!empty(input_videolist[i].year))
                    $(layer+'video_p'+j).getElementsByClassName('submenu_text')[0].innerHTML +=', ';
                if(!empty(countries[input_videolist[i].country]))
                    $(layer+'video_p'+j).getElementsByClassName('submenu_text')[0].innerHTML += countries[input_videolist[i].country];
                else $(layer+'video_p'+j).getElementsByClassName('submenu_text')[0].innerHTML += input_videolist[i].country;
            }
            try{
                for(var y = 0;y<input_videolist[i].genre_list.length;y++){
                    $(layer+'video_p'+j).getElementsByClassName('submenu_text')[0].innerHTML +=', '+input_videolist[i].genre_list[y]['title']
                }
            } catch(e) {}
            var generalRate = 0;
            if(input_videolist[i].rating_kinopoisk)
                generalRate = parseFloat(input_videolist[i].rating_kinopoisk);
            else
            if(input_videolist[i].rating_imdb)
                generalRate = parseFloat(input_videolist[i].rating_imdb);
            generalRate = generalRate.toFixed(2);
            var rate = '';
            rate='<div class="stripes_horizontal_rating"><div class="stripes_horizontal_rating_act"></div>'+generalRate+'</div></div>';
            var arr = $(layer+'video_p'+j).getElementsByClassName('submenu_rating')[0].innerHTML = rate;
            $(layer+'video_p'+j).getElementsByClassName('submenu_rating')[0].getElementsByClassName('stripes_horizontal_rating_act')[0].style.width = generalRate*10+'px';
        }
    }
}


/**
 * обеспечивает перемещение по спискам рекомендуемого, избранного и похожего меню с постоянным запасом в 2 экрана
 * дабы не грузить приставку всем списком сразу и при этом обеспечивать бесшовность переходов
 * @param list список полученных фильмов
 */
function bufferForVerticalCat(list){
    vertical_cat_buffer=JSON.parse(list);
    var j;
    echo('this bufferForVerticalCat req has offset='+vertical_cat_buffer.offset+' limit='+vertical_cat_buffer.limit+' total='+vertical_cat_buffer.total_num);
    echo('this.pos='+subCatLst.pos);
    if(subCatLst_reset_flag===true){    
        // при первом запуске вычисляем длину списка, станицы, загружаем большее кол-во фильмов - все происходит в reset()
        echo('subCatLst_reset_flag was pressed');
        subCatLst.reset();
    }
    else{   
        // у массива всегда заполнены только 5 страниц элементов - остальные страницы динамически при необходимости подгружаются либо стираются
        var i = vertical_cat_buffer.offset;
        if(subCatLst.direct == 'prev')
        {   
            // догрузка элементов в массив фильмов
            for(j=0; j<4; j++){
                if(i===undefined || i*1>=video_files_total_num){
                    echo('buffer break -> offset==undefined, i='+i+' j='+j);
                    break;
                }
                main_video_files_list[i]= vertical_cat_buffer.video_list[j];
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(subCatLst.page+2<subCatLst.number_of_pages-1 && subCatLst.page>1){ 
                // стирание ненужных элементов массива фильмов
                echo('subCatLst.page+2='+(subCatLst.page+2)+'<subCatLst.number_of_pages='+subCatLst.number_of_pages);
                for(var counter_2=(subCatLst.page+3)*3; counter_2<(subCatLst.page+4)*3; counter_2++){
                    main_video_files_list[counter_2]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_2);
                }
            }
        }
        if(subCatLst.direct == 'next'){
            // догрузка элементов в массив фильмов page_down
            for(j=0; j<4; j++){
                echo('i*1>=video_files_total_num=break>'+i+' total='+video_files_total_num);
                if(i*1>=video_files_total_num){
                    break;
                }
                main_video_files_list[i]= vertical_cat_buffer.video_list[j];
                for(var t in vertical_cat_buffer.video_list){
                    echo('we should get 3 elements but we have '+vertical_cat_buffer.video_list[t].id);
                }
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(subCatLst.page-2>0 && subCatLst.page+2<=subCatLst.number_of_pages-1){ 
                // стирание ненужных элементов массива фильмов
                for(var counter_1=(subCatLst.page-3)*3; counter_1<(subCatLst.page-2)*3; counter_1++){
                    main_video_files_list[counter_1]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_1);
                }
            }
        }
    }
}


/**
 * обеспечивает перемещение по каталогу фильмов с постоянным запасом в 2 экрана
 * фильмов, дабы не грузить приставку всем списком сразу и при этом обеспечивать 
 * бесшовность переходов
 * @param list список полученных фильмов
 */
function catalog_buffer(list){
    extSubCatLst.list_buffer=JSON.parse(list);
    var j;
    echo('this cat_buf req has offset='+extSubCatLst.list_buffer.offset+' limit='+extSubCatLst.list_buffer.limit+' total='+extSubCatLst.list_buffer.total_num);
    echo('this.pos='+extSubCatLst.pos);
    if(extCatLst_reset_flag===true){    
        // при первом запуске вычисляем длину списка, станицы, загружаем большее кол-во фильмов - все происходит в reset()
        echo('extCatLst_reset_flag was pressed');
        extSubCatLst.reset();
    }
    else{   
        // у массива всегда заполнены только 5 страниц элементов - остальные страницы динамически при необходимости подгружаются либо стираются
        var i = extSubCatLst.list_buffer.offset;
        if(extSubCatLst.direct == 'prev')
        {   
            // догрузка элементов в массив фильмов
            for(j=0; j<extSubCatLst.page_length; j++){
                if(i===undefined || i*1>=video_files_total_num){
                    echo('buffer break -> offset==undefined, i='+i+' j='+j);
                    break;
                }
                main_video_files_list[i]= extSubCatLst.list_buffer.video_list[j];
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(extSubCatLst.page+2<extSubCatLst.number_of_pages-1 && extSubCatLst.page>1){ 
                // стирание ненужных элементов массива фильмов
                echo('extSubCatLst.page+2='+(extSubCatLst.page+2)+'<extSubCatLst.number_of_pages='+extSubCatLst.number_of_pages);
                for(var counter_2=(extSubCatLst.page+3)*vars[win.height].ext_cont_page_x_max*2; counter_2<(extSubCatLst.page+4)*vars[win.height].ext_cont_page_x_max*2; counter_2++){
                    main_video_files_list[counter_2]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_2);
                }
            }
        }
        if(extSubCatLst.direct == 'next'){
            // догрузка элементов в массив фильмов page_down
            for(j=0; j<extSubCatLst.page_length; j++){
                if(i*1>=video_files_total_num){
                    break;
                }
                main_video_files_list[i]= extSubCatLst.list_buffer.video_list[j];
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(extSubCatLst.page-2>0 && extSubCatLst.page+2<=extSubCatLst.number_of_pages-1){ 
                // стирание ненужных элементов массива фильмов
                for(var counter_1=(extSubCatLst.page-3)*vars[win.height].ext_cont_page_x_max*2; counter_1<(extSubCatLst.page-2)*vars[win.height].ext_cont_page_x_max*2; counter_1++){
                    main_video_files_list[counter_1]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_1);
                }
            }
        }
    }
}


// полный аналог catalog_buffer(list) - как только правильно заработает сервер клиента, будет обьединена с catalog_buffer(list)
function search_buffer(list){
    if(typeof(list)!='object') searchResultLst.list_buffer=JSON.parse(list);
    else searchResultLst.list_buffer=list;
    echo('Is_it_work? searchResultLst.list_buffer.total_num='+searchResultLst.list_buffer.total_num);
    echo('this searchResultLst req has offset='+searchResultLst.list_buffer.offset);
    if(searchResultLst_reset_flag===true){    // при первом запуске вычисляем длину списка, станицы, загружаем большее кол-во фильмов - все происходит в reset()
        echo('searchResultLst_reset_flag was pressed');
        searchResultLst.reset();
    }
    else{   // у массива всегда заполнены только 5 страниц элементов - остальные страницы динамически при необходимости подгружаются либо стираются
//        video_files_total_num=temporary_total_num; // ЗАГЛУШКА //TODO !!!!
        var i = searchResultLst.list_buffer.offset;
        if(searchResultLst.direct == 'prev')
        {   // догрузка элементов в массив фильмов
            for(var j=0; j<searchResultLst.page_length; j++){
                if(i===undefined || i*1>=video_files_total_num){
                    echo('buffer break -> offset==undefined, i='+i+' j='+j);
                    break;
                }
                echo('this film was added to main_video_files_list[]='+i+' from '+j);
                main_video_files_list[i]= searchResultLst.list_buffer.video_list[j];
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(searchResultLst.page+2<searchResultLst.number_of_pages-1 && searchResultLst.page>1){ // стирание ненужных элементов массива фильмов
                echo('searchResultLst.page+3='+(searchResultLst.page+3)+'<searchResultLst.number_of_pages='+searchResultLst.number_of_pages);
                for(var counter_2=(searchResultLst.page+3)*vars[win.height].ext_cont_page_x_max*2; counter_2<(searchResultLst.page+4)*vars[win.height].ext_cont_page_x_max*2; counter_2++){
                    main_video_files_list[counter_2]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_2);
                }
            }
        }
        if(searchResultLst.direct == 'next'){// догрузка элементов в массив фильмов page_down
            //            echo('next at buffer');
            for(var j=0; j<searchResultLst.page_length; j++){
                if(i*1>=video_files_total_num){
                    //                    echo('buffer break i='+i+' j='+j+' video_files_total_num='+video_files_total_num);
                    break;
                }
                main_video_files_list[i]= searchResultLst.list_buffer.video_list[j];
                echo('this film was added to main_video_files_list[]='+i+' from '+j+' its id is='+main_video_files_list[i].id);
                i++;
            }
            if(searchResultLst.page-2>0  && searchResultLst.page+2<=searchResultLst.number_of_pages-1){ // стирание ненужных элементов массива фильмов
                for(var counter_1=(searchResultLst.page-3)*vars[win.height].ext_cont_page_x_max*2; counter_1<(searchResultLst.page-2)*vars[win.height].ext_cont_page_x_max*2; counter_1++){
                    main_video_files_list[counter_1]=undefined;
                    echo('this film was deleted from main_video_files_list[]='+counter_1);
                }
            }
        }
    }
}


/**
 * заполнить меню качества (в меню информации о фильме и меню паузы)
 * @param bitrates список разрешений для данного фильма
 */
function initBitratesLst(bitrates){
    var arr = $('bitrates_id');
    var arr2 = $('movieinfo_quality_id');
        
    while(arr2.childElementCount>1){
        arr2.removeChild(arr2.children[1]);
    }
    while(arr.childElementCount>1){
        arr.removeChild(arr.children[1]);
    }
    
    bitratesLst.length = 0;
    movieinfoQualityLst.length = 0;
    echo('seriesLst.bitrates.length='+seriesLst.bitrates.length);
    if(!empty(seriesLst.bitrates)){
        for(var i=0; i<seriesLst.bitrates.length;i++){
            echo('video bitrate is '+seriesLst.bitrates[i].name);
            seriesLst.bitrates[i].id = seriesLst.bitrates[i].name.substr(strpos(seriesLst.bitrates[i].name,'(',0)+1);
            seriesLst.bitrates[i].id = str_replace(seriesLst.bitrates[i].id,')','');
            echo('video bitrate is '+seriesLst.bitrates[i].name+' and id is '+seriesLst.bitrates[i].id);
            var obj = {
                'tag':'div',
                'attrs':
                {
                    'class':'submenu_series_item',
                    'id': 'bitrates_item_'+i
                },
                'child':
                [
                {
                    'tag':'div',
                    'attrs':
                    {
                        'class':'submenuseries_title',
                        'html':seriesLst.bitrates[i].name+'<span class="quality_descr">'+video_description_data[seriesLst.bitrates[i].id]+'</span>'
                    }
                }
                ]
            }
            var obj2 = {
                'tag':'div',
                'attrs':
                {
                    'class':'submenu_series_item',
                    'id': 'infoQuality_bitrates_item_'+i
                },
                'child':
                [
                {
                    'tag':'div',
                    'attrs':
                    {
                        'class':'submenuseries_title',
                        'html':seriesLst.bitrates[i].name+'<span class="quality_descr2">'+video_description_data[seriesLst.bitrates[i].id]+'</span>'
                    }
                }
                ]
            }

            $('bitrates_id').appendChild(createHTMLTree(obj));
            $('movieinfo_quality_id').appendChild(createHTMLTree(obj2));
            
            movieinfoQualityLst.length++;
            bitratesLst.length++;
        }
    }
}


/**
 * отвечает за создание и заполнение списка серий, реализует постраничное обновление
 * @param {int} season текущий сезон
 * @param {int} page текущая страница списка серий
 */
function initSeriesLst(season, page){
    var title; 
    if (page == undefined)
        page =0;
    var arr = $('series_id');

    episodeLst.maxLength = vars[win.height].seriesLen;
    while(arr.childElementCount>1)
        arr.removeChild(arr.children[1]);
    episodeLst.id = new Array();
    episodeLst.length = 0;
    var tmpLst = [];

    echo('page redrawing => page*episodeLst.maxLength='+page*episodeLst.maxLength);
    echo('page redrawing => file.video[0].season_list[season].episode_list.length='+file.video[0].season_list[season].episode_list.length);
    for(var i=page*episodeLst.maxLength; i< file.video[0].season_list[season].episode_list.length; i++){
        if(i==(page+1)*episodeLst.maxLength)
            break;
        title = file.video[0].season_list[season].episode_list[i].title;
        
        if(file.video[0].season_list[season].episode_list[i].title.length>vars[win.height].seasonTextLen)
            title = file.video[0].season_list[season].episode_list[i].title.slice(0,vars[win.height].seasonTextLen)+'...';

        tmpLst.push(file.video[0].season_list[season].episode_list[i].id);
        var obj = {
            'tag':'div',
            'attrs':
            {
                'class':'submenu_series_item',
                'id': 'episode_item_'+(i-page*episodeLst.maxLength)
            },
            'child':
            [
            {
                'tag':'div',
                'attrs':
                {
                    'class':'submenuseries_title',
                    'html':title
                }
            }
            ]
        }
        $('series_id').appendChild(createHTMLTree(obj));
        episodeLst.id.push(i);
        episodeLst.length++;
    }
    episodeLst.idLst[file.video[0].season_list[seasonLst.pos].id] = tmpLst;
    echo('initSeriesLst end');
}


/**
 * отвечает за предварительное заполнение информацией о фильме экрана инф. о фильме
 * @param {Obj} lst текущий список фильмов (т.е. на котором находимся в данный момент)
 */
function switchMovieInfo(lst){
    echo('switchMovieInfo');
//    $('movie_info_poster').src = 'http://megogo.net'+lst.dataset[lst.offset].poster;  // второй вариант постера, более меньший
    echo('poster is = '+lst.dataset[lst.offset].poster);
    $('movie_info_poster').src = 'http://megogo.net'+lst.dataset[lst.offset].image.big;
    echo('image is = '+lst.dataset[lst.offset].image.big);
    $('movie_info_poster').setAttribute('width',vars[win.height].infoposter_width);
    $('movie_info_poster').setAttribute('height',vars[win.height].infoposter_height);
    seriesLst.bitrates = [];
    $('comments_scrolling_div').innerHTML = '';

    fileInfo = lst.dataset[lst.offset];
    $('info_title').innerHTML = fileInfo.title;
    
    var genre_str='';
    echo('fileInfo.budget='+fileInfo.budget+' fileInfo.rating_kinopoisk='+fileInfo.rating_kinopoisk);
    if(fileInfo.rating_kinopoisk){
        var mainRate= parseFloat(fileInfo.rating_kinopoisk);
        genre_str='<div class="movieinfo_rating"><div class="stripes_genres_horizontal_rating_act" style="width: '+(mainRate*10+1)+'px; "></div></div>';
    }
    if(fileInfo.budget!=undefined && fileInfo.budget!='')
        genre_str +=('<div id="rating_and_budget_id"><span id="budget_id"><b>'+lang_budget+'</b></span> '+fileInfo.budget+'</div>');
    byclass('movieinfo_rating_and_budget')[0].innerHTML = genre_str;
    
    genre_str = '';
    if(!empty(fileInfo.year))
        genre_str += fileInfo.year;
    if(!empty(fileInfo.country)){
        if(!empty(fileInfo.year))
            genre_str +=', ';
        if(!empty(countries[fileInfo.country]))
            genre_str += countries[fileInfo.country];
        else genre_str += fileInfo.country;
    }
    byclass('movieinfo_block')[0].innerHTML = genre_str;
    genre_str = '';
    if(!empty(fileInfo.genre_list)){
        for(var y = 0;y<fileInfo.genre_list.length;y++){
            if(!empty(genre_str))
                genre_str+=', ';
            genre_str +=fileInfo.genre_list[y]['title'];
        }
    }
    // длительность фильма
    if(!empty(fileInfo.duration)){
        var duration=media_getHourMinSec(fileInfo.duration,true);
        var tmp_time='';
        if(duration.hour>0){
            tmp_time=duration.hour+lang_hours_movie_info;
        }
        $('movieinfo_block').innerHTML +=  '<span class="movieinfo_time">'+tmp_time+duration.minute+lang_minutes_movie_info+'</span>';
    }
    
    $('movie_info_genre_id').innerHTML = genre_str;
    obj = $('descr');
    tmp = [];
    if(fileInfo.rating_imdb){
        tmp.push('');
        tmp.push('IMDB: '+fileInfo.rating_imdb);
    }
    if(fileInfo.votes_imdb != undefined && !empty(fileInfo.votes_imdb)){
        tmp.push(' ('+fileInfo.votes_imdb+')');
    }
    if(fileInfo.rating_kinopoisk)
        tmp.push('<br>'+lang_kinopoisk+fileInfo.rating_kinopoisk);
    if(fileInfo.votes_kinopoisk)
        tmp.push(' ('+fileInfo.votes_kinopoisk+')');
    rates = arrToSpecStr(tmp, '', '', '');
    if(!empty(rates))
        $('movieinfo_cast_rating').innerHTML = rates;
    if(!empty(fileInfo.additional_info)){
        $('movie_info_actor_id').style.display = "block";
        $('movie_info_actor_id').children[0].innerHTML = fileInfo.additional_info ;
    }
    else
        $('movie_info_actor_id').style.display = "none";
    obj.innerHTML = '<br>'+fileInfo.description;
    descriptionMovieLst.reset();
    if(fileInfo.isSeries == 0){
        $('info_6').style.display='block';
        $('info_0').innerHTML = lang_menu_play;
        sendreq(iviURL+'video?'+createSign({
            'video':lst.dataset[lst.offset].id, 
            'session':session,'lang':lang
        }),init_info);
    }else{
        $('info_6').style.display='none';
        $('info_0').innerHTML = lang_series_list;
        sendreq(iviURL+'video?'+createSign({
            'video':lst.dataset[lst.offset].id, 
            'session':session,'lang':lang
        }),init_info);
    }
    //  меню "нравится/не нравится"   
    if(fileInfo.like!=undefined && fileInfo.dislike!=undefined)
        $('info_5').innerHTML = lang_marks+': +'+fileInfo.like+'/-'+fileInfo.dislike;
    else
        $('info_5').innerHTML = lang_marks;
}


/**
 * заполнение и дополнение комментариями сооств. страницы в пункте меню информации о фильме
 * @param {String} comments_list_in список комментариев к текущему фильму
 */
function fillCommentsList(comments_list_in){
        var comments_list = JSON.parse(comments_list_in);
        // заполняем список комментариев
        commentsMovieLst.offset+=comments_list.limit;
        commentsMovieLst.total_num=comments_list.total_num;
        
    if(comments_list.comments!==undefined){
        var tmp='',comment_time, tmp_comment_text, month, day;
        var comment_reply='hasnt'; // есть ли родитель у комментария
        // время комментария
        for(var i in comments_list.comments){
            echo('comment number '+i);
            comment_time=comments_list.comments[i].date;

            month=comment_time.substr(5, 2);
            day=comment_time.substr(8, 2);
            comment_time=comment_time.substr(11, 8);

            tmp_comment_text=comments_list.comments[i].text;
            tmp += '<a href="#" class="comment_navigation_url"><div ';
            // реализация иерархии комментариев с помощью отступа от экрана
            if(comment_reply==comments_list.comments[i].parent && comments_list.comments[i].parent>0) {
                tmp +='style="padding-left:45px"';
            } 
            else comment_reply=comments_list.comments[i].id;
            tmp += '><div class = "moveinfo_avatar"><img src = "'+'http://megogo.net'+comments_list.comments[i].user_avatar+'"></div><div class = "movieinfo_comment"><div class="movieinfo_username">';
            tmp += comments_list.comments[i].user_name+' <span class="comment_time">['+day+' '+lang_comments_month[month]+' '+comment_time+']</span></div>'+comments_list.comments[i].text+'</div></div></a>';
        }
    }
       
    if(tmp!=undefined && comments_list.comments!==undefined && comments_list.comments[0].id!==undefined){
        $('comments_scrolling_div').innerHTML += tmp;
        commentsMovieLst.scrolling_list =  $('comments_scrolling_div').clientHeight;
        $('comments_scr_arrow_bottom').style.display = 'block';}
}


/**
 * отвечает за заполнение информацией о фильме экрана инф. о фильме
 * @param {String} text текущий фильм
 */
function init_info(text){
    echo('FILE INNER TEXT ='+'text');
    file = JSON.parse(text);
    movieInfoLst.reset();
    if(file.video[0].isSeries){
        seasonLst.SeasonsAndEpisodesArr=file.video[0].season_list;
                for(var i=0;i<seasonLst.SeasonsAndEpisodesArr[0].episode_list.length;i++){
                echo('init_info file.video[0].season_list[0].episode_list[i].title='+seasonLst.SeasonsAndEpisodesArr[0].episode_list[i].title);
                echo('init_info file.video[0].season_list[0].episode_list[i].id='+seasonLst.SeasonsAndEpisodesArr[0].episode_list[i].id);
                }
        seasonLst.reset();
        initSeriesLst(seasonLst.pos, 0);
        episodeLst.reset();
    }
    
    // запрос на список комментариев
            var url = {
        'video':fileInfo.id, 
        'session':session,
        'limit':30
    }
    sendreq(iviURL+'comments?'+createSign(url),fillCommentsList,true);
    
    // проверяем, голосовали ли пользователь за это фильм
    echo('vote of the user is = '+file.video[0].vote+' fileInfo.title='+file.video[0].title);
    if(file.video[0].vote==0 || file.video[0].vote==1)
    {
        $('lang_dont_like').style.display='none';
        $('lang_like').innerHTML = lang_already_voted;
    }
    else likeLst.reset();
    
    // поведение пункта избранное : добавить или удалить в/из избранного
    if(!empty(favorites[fileInfo.id]))
        $('info_3').innerHTML = lang_from_favourites;
    else $('info_3').innerHTML = lang_to_favourites;
    
    // заполняем список актеров
    if(!empty(file.video[0].people[0])){
        $('actors_scrolling_div').innerHTML = '';
        var actors = new Array();
        for(var i in file.video[0].people){
            if(empty(actors[file.video[0].people[i].type_title]))
                actors[file.video[0].people[i].type_title] =  file.video[0].people[i].title + ',';
            else
                actors[file.video[0].people[i].type_title] +=  file.video[0].people[i].title + ',';
            // запоняем поле режиссера
            if(file.video[0].people[i].type === 'DIRECTOR'){ 
                if(file.video[0].people[i].title!=undefined){
                    $('director_id').getElementsByClassName('movieinfo_cast_actor')[0].innerHTML = file.video[0].people[i].title;
                    $('director_id').style.display = 'block';
                }
                else{
                    $('director_id').style.display = 'none';
                }
            }
            
        }
        for(var i in actors){
            actors[i] = actors[i].substring(0,actors[i].length-1);
            if(strpos( actors[i], ',', 0)!= false)
                var j = i+lang_multiply; // улыбнуло
            else j = i;
            $('actors_scrolling_div').innerHTML +='<div class="movieactors">'+j+'<div class="movieactors_cast">'+actors[i]+'</div></div>';
        }
        actorsMovieLst.reset();
    }
    
    // списки серий и сезонов
    var arr = $('season_id');
    while(arr.childElementCount>1)
        arr.removeChild(arr.children[1]);
    seasonLst.id = new Array();
    seasonLst.length = 0;
    var title;
    if(!empty(file.video[0].season_list[0])){
        for(var i in file.video[0].season_list){
            title = file.video[0].season_list[i].title;
            if(file.video[0].season_list[i].title.length>vars[win.height].seasonTextLen)
                title = file.video[0].season_list[i].title.slice(0,vars[win.height].seasonTextLen)+'...';

            var obj = {
                'tag':'div',
                'attrs':
                {
                    'class':'submenu_series_item',
                    'id': 'season_item_'+i
                },
                'child':
                [
                {
                    'tag':'div',
                    'attrs':
                    {
                        'class':'submenuseries_title',
                        'html':   title
                    }
                }
                ]
            }
            $('season_id').appendChild(createHTMLTree(obj));
            seasonLst.id.push(i);
            seasonLst.length++;
        }
        initSeriesLst(0);
    }
    
    // запрос на качество фильма
    var url = {
        'video':fileInfo.id, 
        'session':session
    }
    if(fileInfo.isSeries){
        season = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].id;
        if(!empty(seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id)){
            url['episode'] = seasonLst.SeasonsAndEpisodesArr[seasonLst.season_number].episode_list[episodeLst.episode_number].id;
            url['season'] = season;
        }
    }
    sendreq(iviURL+'info?'+createSign(url),getStreamInfo,true);
    
    currLst = movieInfoLst;
    currLst.onChange();
}


/**
 * обработка ответа запроса данных о видеофайле (а имено -  качества)
 * @param text результат запроса /p/info?video=<id>
 */
function getStreamInfo(text){
    echo('getStreamInfo() rez='+text);
    var tmp = JSON.parse(text);
    if(tmp.error!== undefined){echo('server error, no bitrates for this film');}
    echo('__________________!!!________________');
    echo('tmp.bitrates.length='+tmp.bitrates.length);
    echo('tmp.bitrates[0].name='+tmp.bitrates[0].name);

    for(var i=0,j=tmp.bitrates.length-1; i<tmp.bitrates.length; i++,j--){
        seriesLst.bitrates[i] = tmp.bitrates[j];    
        echo('reversing bitrate list '+i+' '+j);
        echo('video bitrate is '+seriesLst.bitrates[i].name);
    }
    initBitratesLst(seriesLst.bitrates);
}


/**
 * запуск видео по ссылке на источник
 * @param text плейлист
 */
function start_playing1(text){
    playlist = JSON.parse(text);
    $('video_title').innerHTML = playlist.title;
    switchLayer(layer_player);
    $('footer').style.display = 'none';
    stb.Play('ffmpeg '+playlist.src);
    $('player_page').style.display = 'block';
}


/**
 *  получить возможные варианты названий искомого фильма в запросе вида
 *  /p/searchsuggest?text=<text>&[category=<cat_id>&genre=<genre_id>&session=<session_id>]&sign=<sign>
 */
function get_suggest(){ 
    if(empty($('search_line').value) | $('search_line').value.length<4)
        return;
//    // заглушка для подсчета количества присланных ответов (т.е. сколько реально ответов мы должны получить по этим ключевикам)
//    temporaryDesicion($('search_line').value);
    //hiding search box and showing loading screen
    $('search_modal_box').style.display='none';
    stb.HideVirtualKeyboard(); 
    $('search_line').blur();
              
    url = {
        'text':$('search_line').value
    };
    sendreq(megogoURL+'p/search?'+createSign({
        'text':$('search_line').value, 
        'session':session,
        'limit':vars[win.height].ext_cont_page_x_max*2*3,'lang':lang
    }), build_suggest);
    return;
    var url = iviURL+'autocomplete/v2/?query='+$('search_line').value;
    echo('autocomplete at get_suggest()');
    sendreq(url,build_suggest,true);
}


///** заглушка для подсчета количества присланных ответов (т.е. сколько реально ответов мы должны получить по этим ключевикам)
// * @param {String} text искомый запрос
// */
//function temporaryDesicion(text){
//        echo('temporaryDesicion REQUEST text: '+text);
//        var temprequest = new XMLHttpRequest();
//        temprequest.open('GET', megogoURL+'p/search?'+createSign({
//        'text':text, 
//        'session':session,
//        'limit':200
//    }), false);
//
//        temprequest.onreadystatechange = function (){
//            if (temprequest.readyState == 4 && temprequest.status == 200) {
//                echo('temporaryDesicion()->there is ansver for url'+text);
//                var answer = JSON.parse(temprequest.responseText);
////                callback(answer);
//                temporary_total_num=answer.video_list.length;
//                echo('temporary_total_num='+temporary_total_num);
//                
//            }else{
//                if(temprequest.readyState == 4 && temprequest.status != 200){
//                    echo('temporaryDesicion error for url='+text);
//                    echo('temporaryDesicion error responseText='+temprequest.responseText);
//                    echo('temporaryDesicion error status='+temprequest.status);
//                    echo('temporaryDesicion error readyState='+temprequest.readyState);
//                }
//            }
//        }
//        temprequest.send(null); // send object
//}


/**
 *  обработать возможные варианты названий искомого фильма в запросе 
 *  @param text возможные варианты
 */
function build_suggest(text){
    var sug_obj = JSON.parse(text);
    echo('build_suggest(text) text='+text);
    searchLst.onEnter(sug_obj);
}


/**
 * вызывается 1 раз для закрытия модального окна 
 * пересмотреть полезность
 */
function exit_modal(){
    document.getElementsByClassName('modal')[0].style.display = 'none';
    document.getElementsByClassName('modal_list')[0].innerHTML = '';
    CUR_LAYER = PREV_LAYER;
    layer_indexes.active[layer_genre]=0;
}


/**
 *  модальное окно ожидания
 * @param waiting_time время ожидания
 */
function show_waiting(waiting_time){
    if(waiting_time==undefined)waiting_time=5000;
    echo('===== show_waiting ======');
    newAlert_on = true;
    var arr = document.getElementsByClassName('modal_box');
    while(arr[0].childElementCount)
        arr[0].removeChild(arr[0].children[0]);
    var obj = document.createElement('div');
    obj.className = 'modal_login';
    obj.innerHTML = lang_loading_message;
    document.getElementsByClassName('modal_box')[0].appendChild(obj);
    document.getElementsByClassName('modal')[0].style.display = 'block';
    document.getElementsByClassName('modal_box')[0].style.display = 'block';
    window.setTimeout(function(){
        echo('==== hide_waiting ====');
        newAlert_on = false;
        document.getElementsByClassName('modal_box')[0].style.display = 'none';
        document.getElementsByClassName('modal')[0].style.display = 'none';
        if(CUR_LAYER != layer_player && CUR_LAYER != layer_search)
            CUR_LAYER = layer_cats;
        
    }, waiting_time);
}


/**
 * закрыть сообщение об ошибке
 */
function close_auth_attention(){
    echo('close_auth_attention()');
    newAlert_on = false;
    document.getElementsByClassName('modal')[0].style.display = 'none';
    byclass('modal_box')[0].style.display = 'none';
    if(CUR_LAYER != layer_player)
        CUR_LAYER = layer_cats;
}


/**
 *  модальный экран просьбы авторизироваться либо сообщения об ошибки
 * @param str текст выводимого сообщение
 */
function show_auth_request(str){
    log('==== show_auth_request ====');
    newAlert_on = true;
    var arr = document.getElementsByClassName('modal_box');
    while(arr[0].childElementCount)
        arr[0].removeChild(arr[0].children[0]);
    var obj = document.createElement('div');
    obj.className = 'modal_login';
    obj.innerHTML = str;
    byclass('modal_box')[0].appendChild(obj);
    byclass('modal_box')[0].innerHTML+='<input id="modal_ok_button" type="button" value="OK"  />';
    byclass('modal')[0].style.display = 'block';
    $('main_auth_modal_box').style.display = 'block';
    echo('main_auth_modal_box'+$('main_auth_modal_box').innerHTML);
    byclass('modal_box')[0].style.display = 'block';
}


/**
 *  сменить текущий слой (от него зависит поведение keyhandler'a и навигации)
 */
function switchLayer(layer){
    log('Switch layer from <'+layers[CUR_LAYER]+'> to <'+layers[layer]+'>');
    $(layers[CUR_LAYER]).style.display = 'none';
    $(layers[layer]).style.display = 'block';
    PREV_LAYER = CUR_LAYER;
    CUR_LAYER = layer;
    if(layer==layer_player) document.body.style.background = 'none';
}


/**
 * получить список "избранное" 
 * @param text список избранных фильмов
 */
function setFavorits(text){
    var res = JSON.parse(text);
    var d =  fileInfo['id'];
    if(res.result == 'ok')
        if ( !empty(favorites[d]) ) {
            $('info_3').innerHTML = lang_to_favourites;
            favorites.splice(d,1);
        } else {
            $('info_3').innerHTML = lang_from_favourites;
            favorites[d] = 1;
        }
    flFavorUpdate = 1;
    sendreq(iviURL+'favorites?'+createSign({
        'session':session,'lang':lang
    }),getFavorits);
}


/**
 * обновить список "избранное" 
 * @param text список избранных фильмов
 */
function getFavorits(text){
    var file = JSON.parse(text);
    favorites = [];
    //file.video_list.forEach()
    for(var i=0; i< file.video_list.length; i++)
        favorites[file.video_list[i].id] = 1;
}


/**
 * сменить пунк меню "проголосовать" на "проголосовал"
 */
function setLike(text){
    var res = JSON.parse(text);
    if(res.result == 'ok')
        $('info_5').innerHTML = lang_marks+': +'+res.like+'/-'+res.dislike;
}


function finish(text){
    log(text);
    res = JSON.parse(text);
}


/**
 *  закрыть модальное окно предупреждения
 */
function close_loading_attention(){
    echo('=== close_loading_attention() ===');
    newAlert_on = false;
    document.getElementsByClassName('modal')[0].style.display = 'none';
    byclass('modal_box')[0].style.display = 'none';
    if(CUR_LAYER != layer_player)
        CUR_LAYER = layer_cats;
}


/**
 *  открыть модальное окно предупреждения
 *  @param str текст сообщения
 */
function show_loading_attention(str){
    log('==== show_loading_attention ====');
    newAlert_on = true;
    var arr = document.getElementsByClassName('modal_box');
    while(arr[0].childElementCount)
        arr[0].removeChild(arr[0].children[0]);
    var obj = document.createElement('div');
    obj.className = 'modal_login';
    obj.innerHTML = str;
    document.getElementsByClassName('modal_box')[0].appendChild(obj);
    document.getElementsByClassName('modal')[0].style.display = 'block';
    $('main_auth_modal_box').style.display = 'block';
    byclass('modal_box')[0].style.display = 'block';
}


/**
 * работает с массивом запомненых значений и id фильмов
 * @param {int} id  фильма или сериала при выходе
 * @param {int} pos позиция в фильме при выходе
 * @param {String} action действие с данными
 * @return {int} continuous_time время на котором остановились
 */
function videosContinueHandler(id,pos,action){
    var result=false;
    if(action==='add'){
        for(var key in videofiles_continue_array) {
            if(videofiles_continue_array[key].id===id){
                videofiles_continue_array[key].time_pos=pos;
                result = true;   
            }
        }
        if(!result){
            videofiles_continue_array.push({
                'id':id,
                'time_pos':pos
            });
        } 
    }
    if(action=='look_for'){
        for(var i in videofiles_continue_array) {
            if(videofiles_continue_array[i].id===id){
                var continuous_time=videofiles_continue_array[i].time_pos;
                echo('We have found continue position for this video='+continuous_time);
                return continuous_time; 
                break;
            }
        }
    }
    for(var key2 in videofiles_continue_array) {
        echo('videofiles_continue_array[key2].id='+videofiles_continue_array[key2].id);
        echo('videofiles_continue_array[key2].time_pos='+videofiles_continue_array[key2].time_pos);
    }
    
}