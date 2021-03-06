/*----------  INSTALLATION  ----------*/
	
	/*----------  Bot install  ----------*/
		var TelegramBot = require('node-telegram-bot-api'),
		    request = require('request'),
		    jsdom = require('jsdom'),
		    { JSDOM } = jsdom,
		    token = '388812803:AAHr_1dJQW_24_fVh5EPuIlxvIoWxmrCQRY',
		    bot = new TelegramBot(token, {
				polling: true,
			});

	/*----------  Programm install  ----------*/
		var url = 'http://www.lp.edu.ua/rozklad-dlya-studentiv-zaochnykiv?group=%D0%9A%D0%9D-22%D0%B7&semestr=0',
			timetable = ['8:30', '10:20', '12:10', '14:15', '16:00', '17:40', '19:20', '21:00'],
			buildingsPos = {1 : [49.835441, 24.010215], 2 : [49.836056, 24.012410], 3 : [49.836594, 24.013432], 
							4 : [49.836422, 24.011146], 5 : [49.835160, 24.008366], 6 : [49.835116, 24.006606], 
							7 : [49.834504, 24.009738], 8 : [49.837440, 24.014839], 9 : [49.836394, 24.014334],
							10 : [49.836389, 24.015223], 11 : [49.835878, 24.016370], 13 : [49.835502, 24.014441],
							14 : [49.835443, 24.016603], 15 : [49.835728, 24.017047], 16 : [49.835443, 24.016603],
							17 : [49.835443, 24.016603], 19 : [49.838290, 24.033125], 33 : [49.840931, 24.029399]};

	/*----------  Parsers  ----------*/
	
		/*----------  Subjects parser (part-time)  ----------*/
			var getArrOfSubjects = function (msg, body) {
				var dom = new JSDOM(body),
				    table = dom.window.document.querySelector("table.outer tbody");

				var tableTrs = table.querySelectorAll('tr'),
				days = [];
				    
				var arr = [tableTrs[0]];

				for(var i = 1; i < tableTrs.length; i++){
					if(!!tableTrs[i].querySelector('.data')){
				        arr.splice(1,1);
				        days.push(arr);
				        arr = [];
				    }
				    arr.push(tableTrs[i]);
				};

				return days;
			};

/*----------  FUNCTIONS  ----------*/
	
	bot.onText(/\/start/, (msg) => {
		bot.sendMessage(msg.chat.id, "Welcome", {
			"reply_markup": {
				"keyboard": [["/next","/today"], ["/help"]]
			}
		});   
	});

	/*----------  Function on '/next'  ----------*/
		bot.onText(/\/next/, (msg) => {
			request(url, (error, response, body) => {
			    var userID = msg.chat.id,
			    	days = getArrOfSubjects(msg, body),
			    	date = new Date();
			    	// date.setHours('14');
			    	// date.setMinutes('20');
			    var curTime = `${date.getHours()}${date.getMinutes()}`,
			        curDate = `${date.getDate()}.${date.getMonth()+1 < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1}.${date.getFullYear()}`;

			    // days[5][0].textContent = '20.09.2017';
			    // days[5][5].children[0].textContent = '6';

			    var message = '';

			    for(var i = 0; i < days.length; i++){
			    	if(days[i][0].textContent === curDate){

				        for(var j = 0; j < timetable.length; j++){
				        	if(+timetable[j].replace(':', '') > +curTime){

				        		var subject = days[i][j+1].children[1].textContent,
				        			teacher = days[i][j+1].children[2].textContent,
				        			building = days[i][j+1].children[3].textContent,
				        			room = days[i][j+1].children[4].textContent;

				        		message = `Наступна пара - <b>${subject}</b>\nВідбудеться о <b>${timetable[days[i][j+1].children[0].textContent - 1]}</b> в аудиторії №<b>${room}</b>, <b>${building}</b>`;
				        		break;
				        	}
				        }
			      	}
			    }
			    if(message.length != 0){
			    	bot.sendMessage(userID, message, {parse_mode : "HTML"});
			    }
			    else{
			    	bot.sendMessage(userID, 'Більше сьогодні пар немає!');
			    }

			});
		});

	/*----------  Function on '/today'  ----------*/
		bot.onText(/\/today/, (msg) => {
			request(url, (error, response, body) => {
				var userID = msg.chat.id,
					days = getArrOfSubjects(msg, body),
					date = new Date();
			    	date.setHours('11');
			    	date.setMinutes('20');
			    var curTime = `${date.getHours()}${date.getMinutes()}`,
			        curDate = `${date.getDate()}.${date.getMonth()+1 < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1}.${date.getFullYear()}`;

			    days[5][0].textContent = '20.09.2017';
			    days[5][5].children[0].textContent = '6';

			    var message = '';

			    for(var i = 0; i < days.length; i++){
			    	if(days[i][0].textContent === curDate){
			    		for(var j = 1; j < days[i].length; j++){
			    			message += `${days[i][j].children[0].textContent} (${timetable[days[i][j].children[0].textContent - 1]}) - <b>${days[i][j].children[1].textContent}</b>\n`;
			    		}
			      	}
			    }
			    if(message.length != 0){
			    	bot.sendMessage(userID, message, {parse_mode : "HTML"});
			    }
			    else{
			    	bot.sendMessage(userID, "Сьогодні пар немає!");
			    }
			});
		});

	/*----------  Function on '/where'  ----------*/
		bot.onText(/\/where (.+)/, (msg, match) => {
			var userID = msg.chat.id,
				place = buildingsPos[match[1]];

			if(place){
				bot.sendLocation(userID, place[0], place[1]);
			}
			else{
				bot.sendMessage(userID, "Вибач, я не знаю де це :с");
			}
		});