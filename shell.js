var shellObj = {
    'shell-container': '#shell-c',
    'background-color': 'black',
    'prompt-sign': '►',
    'prompt-sign-color': 'lime',
    'prompt-answer-color': 'yellow',
    'commands': {
        'alias -soft': ["aliasSoft", "prompt", ["command:", "alias:"]],
        'alias -hard': ["aliasHard", "prompt", ["command:", "alias:", "arguments:"]],
        'alias -delete': ["aliasDelete", "prompt", ["alias:"]],
        'cancelCommand': ["canceled", []],
        'cbb': ["bgChanger", "autoPrompt", ["dodgerblue", "OK good job", "oh no"]],
        'change bg': ["bgChanger", "prompt", ["color:", "success message:", "fail message:"]],
        'cls': ["commandCls", ""],
        'clear': ["commandCls", ""],
        'hello': ["hi", []],
        'help': ["commandHelp", ""],
        'how are you': ["im fine thanks", ""],
        'longtext': ["Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", ""]
    }
},
commandsHistory = [],
counter1,
counter2 = [0, ''],
infoFromUser = [];
var autoCommand = {
    a:null,
    i:0,
    j:0,
    cmd: '',
    Queue: [],
    Perm: true,
    add: function (cmd, answer = false) {
        if (answer == false) {
            this.Queue.push(cmd);
        } else {
            this.Queue.push(cmd);
            shellObj.commands[cmd] = [answer, []];
        }
    },
    type: function (cmd) {
        if (this.i == cmd.length) {
            this.pressEnter();
            this.a = null;
            this.i = 0;
        } else {
            this.cmd = cmd;
            autoCommand.i += 1;
            this.typeCmd(cmd);
            this.a = setTimeout(function () {autoCommand.type(cmd);}, 30);
        }
    },
    pressEnter: function () {
        $('.prompt-command-class').last().focus();
        $(function() {
            var e = $.Event('keypress');
            e.which = 13; // Character 'A'
            e.keyCode = 13;
            $('.prompt-command-class').last().trigger(e);
        });
    },
    typeCmd: function (cmd) {
        let oldVal = $('.prompt-command-class').last().html();
        let newLetter = cmd.slice(this.i - 1,this.i);
        let newVal = oldVal + newLetter;
        $('.prompt-command-class').last().html(newVal);
    },
    run: function () {
        if (autoCommand.j + 1 <= autoCommand.Queue.length) {
            $('.prompt-command-class').last().html('');
            autoCommand.type(autoCommand.Queue[autoCommand.j]);
            autoCommand.j += 1;
        } else {
            this.Queue = [];
            autoCommand.j = 0;
        }
    },
    finalizingCommand: function () {
        delete shellObj.commands[this.cmd];
        this.cmd = '';
        this.run();
    }
}
function commandHelp() {
    var win = window.open('https://www.google.com', '_blank');
    win.focus();
    return 'we will redirect you to sjcm help page';
}
function commandCls() {
    $(shellObj['shell-container']).find('div').remove();
    return '';
}
function makeAShell(container) {
    $(container).css('background-color', shellObj['background-color']);
    makeAPrompt(container);
}
function makeAPrompt (container, prompt = '', parentCommand = '') {
    let prompt_c;
    if (prompt === '') {
        prompt_c = $('<div><b>'+shellObj['prompt-sign']+'</b><pre> </pre></div>').appendTo(container);
    } else {
        prompt_c = $('<div><b>'+prompt+'</b><pre> </pre></div>').appendTo(container);
    }
    $(prompt_c).css({
        position: 'relative',
        border: '1px solid black',
        width: '100%',
        height: '30px',
        boxSizing: 'border-box',
        paddingLeft: '5px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: shellObj['prompt-sign-color'],
        whiteSpace: 'nowrap'
    });
    let prompt_command = $('<div contenteditable="true" class="prompt-command-class"></div>').appendTo(prompt_c);
    $(prompt_command).css({
        position: 'relative',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        lineHeight: '180%',
        fontWeight: '100',
        color: 'white',
        fontFamily: "Courier",
        fontSize: "0.9rem",
        outline: 'none'
    });
    $(prompt_command).focus();
    $(prompt_command).keypress(function (event) {
        let command = $(this).html();
        if (event.keyCode == 13) {
            event.preventDefault();
            if (prompt !== '' && parentCommand !== '') {
                makeAnAnswer(infoFromUser, container, parentCommand);
            } else if (prompt !== '' && parentCommand === '') {
                infoFromUser.push(command);
                makeAnAnswer(counter2[1], 'prompt');
            } else {
                commandsHistory.push(command);
                counter1 = commandsHistory.length;
                makeAnAnswer(command, container); // change bg, #shell-c
            }
        }
    });
    $(prompt_command).keydown(function (event) {
        if (event.keyCode == 38) {
            event.preventDefault();
            counter1 = counter1 >= 1 ? counter1 -= 1 : counter1 = commandsHistory.length - 1;
            $(this).html(commandsHistory[counter1]);
            posAtEnd(this);
        } else if (event.keyCode == 40){
            event.preventDefault();
            counter1 = counter1 < commandsHistory.length - 1 ? counter1 += 1 : counter1 = 0;
            $(this).html(commandsHistory[counter1]);
            posAtEnd(this);
        }
    });
}
function posAtEnd (el) {
    let sel = document.getSelection();
    range = sel.getRangeAt(0);
    range.setStart(el, 0);
    range.setEnd(el, 1);
    range.collapse();
}
function makeAnAnswer(command, container, parentCommand = false) {
    $('.prompt-command-class').attr('contenteditable', 'false');
    let commandsObj = shellObj['commands'];
    if (parentCommand !== false) {
        try {
            let jsonVal = commandsObj[parentCommand][0];
            let arg = infoFromUser;
            if (arg !== 'prompt') {
                showAnswer(eval(jsonVal)(arg), container);
                return;
            }
        } catch (e) {
            showAnswer(`an error has occured <br> ${e}`, container);
            return;
        }
    }
    try {
        let jsonVal = commandsObj[command][0]; // bgChanger
        let arg = commandsObj[command][1]; // prompt
        if (arg !== 'prompt' && arg !== 'autoPrompt') {
            showAnswer(eval(jsonVal)(arg), container);
            return;
        } else if (arg === 'prompt') {
            if (counter2[0] == commandsObj[command][2].length) {
                makeAnAnswer('', shellObj['shell-container'], counter2[1]); //command is the same parentCommand now! // #shell-c, color, ''
                counter2[0] = 0;
                counter2[1] = '';
                infoFromUser = [];
            } else {
                makeAPrompt(shellObj['shell-container'], commandsObj[command][2][counter2[0]]); //command is the same parentCommand now! // #shell-c, color, ''
                counter2[0] += 1;
                counter2[1] = command; // TODO: over one arg and its a problem
            }
        } else if (arg === 'autoPrompt') {
            infoFromUser = commandsObj[command][2];
            makeAnAnswer('', shellObj['shell-container'], command);
            infoFromUser = [];
        }
    } catch (e) {
        try {
            let jsonVal = commandsObj[command][0];
            let ifArg = commandsObj[command][1];
            for (let key in commandsObj){
                if(commandsObj.hasOwnProperty(key)){
                    if (command == key) {
                        showAnswer(jsonVal, container);
                        return;
                    }
                }
            }
        } catch (e) {
            showAnswer('this command doesn\'t exists', container);
        }
    }
}
function showAnswer(answer, container) {
    if (answer == '') {
        makeAPrompt(shellObj['shell-container']);
        return;
    }
    let answer_c = $('<div>'+answer+'</div>').appendTo(container);
    $(answer_c).css({
        position: 'relative',
        border: '1px solid black',
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: '3px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontSize: '100',
        color: shellObj['prompt-answer-color'],
        overflowY: 'hidden'
    });
    makeAPrompt(shellObj['shell-container']);
}
function aliasSoft (backedArr) {
    let command = backedArr[0];
    let newCommand = backedArr[1];
    if (shellObj['commands'][command] === undefined) return 'the command you try to make alias from doesn\'t exists';
    if (shellObj['commands'][newCommand] !== undefined) return 'the alias command exists';
    // let situation = shellObj['commands'][command][1] == 'prompt' ? 'hard' : 'soft';
    shellObj['commands'][newCommand] = shellObj['commands'][command];
    syncAlias();
    return 'alias has set';
}
function aliasHard (backedArr) {
    let command = backedArr[0];
    let newCommand = backedArr[1];
    let args = backedArr[2];
    args = args.split(',');
    args.forEach(function (v, i) {
        if (v == null || v == 'null' || v == '' || v == ' ' || v == "&nbsp;") args[i] = '';
    });
    if (shellObj['commands'][command] === undefined) return 'the command you try to make alias from doesn\'t exists';
    if (shellObj['commands'][newCommand] !== undefined) return 'the alias command exists';
    shellObj['commands'][newCommand] = [shellObj['commands'][command][0], 'autoPrompt', args];
    syncAlias();
    return 'alias has set';
}
function aliasDelete (backedArr) {
    return 'not available when using simple shell in chrome';
    // try {
    //     let alias = backedArr[0];
    //     console.log(alias);
    //     let readedFromUserAlias;
    //     let jsonForSyncOld;
    //     readedFromUserAlias = fs.readFileSync("user-alias.json", 'utf8');
    //     try {
    //         jsonForSyncOld = JSON.parse(readedFromUserAlias);
    //     } catch (e) {
    //         dialog.showMessageBoxSync({type:"warning", message: "Dear user, it seems that you destroyed or modified \'user-alias.json\'! please reverse your changes and then reload application"});
    //         return;
    //     }
    //     try {
    //         delete jsonForSyncOld[alias];
    //         delete shellObj.commands[alias];
    //         fs.writeFileSync("user-alias.json", JSON.stringify(jsonForSyncOld));
    //     } catch (e) {
    //         return e;
    //     }
    // } catch {
    //     return 'an error has occured';
    // }
}
function ctrlc () {
    document.onkeyup = function(e) {
        let key = e.which || e.keyCode;
        if (e.ctrlKey == false || key !== 67) return;
        infoFromUser = [];
        counter2 = [0, ''];
        makeAnAnswer('cancelCommand', shellObj['shell-container']);
    };
}
function syncAlias (jsonForSync = false) {
    //save your alias in a file for further use...
    // let jsonForSyncNew;
    // let readedFromUserAlias;
    // let jsonForSyncOld;
    // readedFromUserAlias = fs.readFileSync("user-alias.json", 'utf8');
    // try {
    //     jsonForSyncOld = JSON.parse(readedFromUserAlias);
    // } catch (e) {
    //     dialog.showMessageBoxSync({type:"warning", message: "Dear user, it seems that you destroyed or modified \'user-alias.json\'! please reverse your changes and then reload application"});
    //     return;
    // }
    // if (jsonForSync !== false) {
    //     jsonForSyncNew = JSON.parse(jsonForSync);
    //     try {
    //         jsonForSyncOld = JSON.parse(readedFromUserAlias);
    //     } catch (e) {
    //         alert('Dear user, it seems that you destroyed or modified \'user-alias.json\'! please reverse your changes');
    //         console.log(e);
    //     }
    //     fs.writeFileSync("user-alias.json", JSON.stringify(Object.assign(jsonForSyncNew, jsonForSyncOld)));
    //     return;
    // }
    // shellObj['commands'] = Object.assign(jsonForSyncOld, shellObj['commands']);
    // return;
}
makeAShell(shellObj['shell-container']);
ctrlc();
autoCommand.add('answer me how are you', 'how are you!!!');
autoCommand.run();
