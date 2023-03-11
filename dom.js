let devTest;

$("#speedRange").ionRangeSlider({
    skin: "square",
    grid: true,
    min: 0.2,
    max: 6,
    from: 1,
    step: 0.2,
    hide_from_to: true,
    force_edges: true,
    hide_min_max: true,
    onChange: (obj) => {
        const rec = 1 / obj.from;
        Handler.a.config.timeMult = rec;
        if(Handler.a.ongoing){
            Handler.a.ongoing.forEach(ani => ani.timeScale = (ani.og.timeMult / rec));
        }
    }
})

$("#genAmount").ionRangeSlider({
    skin: "square",
    grid: true,
    min: 4,
    max: F1.length,
    from: 5,
    hide_from_to: true,
    force_edges: true,
    hide_min_max: true,
})

$(`input[type="checkbox"]`).prop("checked", false);
$(`.toggle`).each(function(){
    $(this).find(`input`).on("change", function(){
        $(this).parent().attr("data-value", this.checked);
    })
})

$("#f1mode").on("change", function(){
    $("#visualize, #visualize + div, #inputsCont").css("display", this.checked ? "none" : "block");
})

$("#cubeMode").on("change", function(){
    Human.cubeHead = this.checked;
    list.forEach(el => el.changeHead());
})

$("#visualize").on("click", function(){
    const values = $("#inputs").val().trim().split(/\s/g); // all type of white space
    if(values.length == 0) return;

    $(this).prop("disabled", true);
    createjs.Tween.get(this).wait(250).call(() => $(this).prop("disabled", false));

    // deletes all current humans
    list.deleteAll();

    // create humans based on values
    const humans = values.map(v => {
        const value = parseFloat(v);
        if(isNaN(value)) return null;
        return new Human({
            name: "",
            value: value,
            height: Human.default_height,
            hasTexture: false
        })
    }).filter(h => h != null);

    // add it to human array
    list.add(...humans);

    // refresh following list
    list._updateFollower();
})

$("#autocont_cont").hide();
$("#sortbtn").on("click", function(){
    $("#shufflebtn, #genElementCont").hide();
    $("#stopbtn, #contbtn").show();
    $(this).hide();

    console.time("sorting");
    QuickSort.sort(list);
    console.timeEnd("sorting");

    $("#autocont_cont").show();

    Handler.addAnimation(new Animation(() => {
        $("#shufflebtn, #genElementCont").show();
        $("#stopbtn, #contbtn").hide();
        $(this).show();
        $("#autocont_cont").hide();
    }, 10, 0, 0));
})

$("#stopbtn, #contbtn").hide();
$("#stopbtn").on("click", function(){
    const revealing = Handler.a.queue.pop();
    Handler.a.queue.length = 0;
    Handler.addAnimation(revealing);
    if(Handler.a.ongoing) Handler.a.ongoing.forEach(anim => anim.setPosition(anim.duration));
    const savedTimeMult = Handler.a.config.timeMult;
    Handler.a.config.timeMult = 0.1;
    list.backToState();
    Handler.a.config.timeMult = savedTimeMult;
    Handler.continue();
})

$("#shufflebtn").on("click", () => {list.shuffle()})

$("#generate").on("click", function(){
    const f1Mode = $("#f1mode").prop("checked"),
          amount = $("#genAmount").data("ionRangeSlider").result.from;

    $(this).prop("disabled", true);
    createjs.Tween.get(this).wait(250).call(() => $(this).prop("disabled", false));

    // deletes all current humans
    list.deleteAll();

    if(f1Mode){
        const indexes = [];

        for(let i = 0; i < amount; i++){
            const gen = Util.genInt(0, F1.length);
            if(indexes.some(e => e == gen)) i--;
            else indexes.push(gen);
        }

        // console.log(indexes.map(e => F1_enator(e)));
        list.add(...indexes.map(e => F1_enator(e)));

        // refresh following list
        list._updateFollower();
    }else{
        $("#inputs").val(Array(amount).fill(0).map(x => {
            return Util.genInt(1, 99);
        }).join(" "))

        
        $("#visualize").click()
    }

})

$("#stopFollow").hide();
$("#followTarget").on("click", function(){
    const target = $("#humanList").val();
    if(target == "null") return;

    // get the human
    const human = list.h.find(e => e.id == target);

    // set that to focusing on handler  
    Handler.follow(human.body);

    $("#stopFollow").show();
    $(this).hide();
    $("#humanList").hide();

    // hide generating elements
    $("#genElementCont").hide();
})

$("#stopFollow").on("click", function(){
    $(this).hide();
    $("#humanList, #followTarget").show();
    Handler.unFollow();
    if(Handler.a.queue.length == 0) $("#genElementCont").show();
})

// Skipping controls
const SKIP = {
    swap: false,
    compare: false,
    partition: false
};

["swap", "compare", "partition"].forEach(cont => {
    $(`#skip_${cont}`).on("click", function(){
        const type = this.id.split("_")[1];
        SKIP[type] = this.checked;
        Animation[this.checked ? "addSkips" : "removeSkip"](`pause_${type}`);
        if(!this.checked) return;
        if(Handler.a.ongoing?.name == `pause_${type}`) Handler.continue();
    })
})

// Disclaimer
$("#closeDisclaimer").on("click", function(){
    $(this).parent().hide();
})

function pan_cam(direction){

    const pan_intensity = 20, 
          pan_duration = 250,
          pan_ease = createjs.Ease.quartInOut;

    const buffer = Handler.cam.position.clone(),
          tween = createjs.Tween.get(buffer),
          bufferControl = Handler.controls.target.clone(),
          tweenControl = createjs.Tween.get(bufferControl);


    switch(direction){
        case "LEFT":
            tween.to(buffer.clone()
                .add(new THREE.Vector3(-pan_intensity, 0, 0)),
                pan_duration, pan_ease
            )
            tweenControl.to(bufferControl.clone()
                .add(new THREE.Vector3(-pan_intensity, 0, 0)),
                pan_duration, pan_ease
            )
            break;
        case "RIGHT":
            tween.to(buffer.clone()
                .add(new THREE.Vector3(pan_intensity, 0, 0)),
                pan_duration, pan_ease
            )
            tweenControl.to(bufferControl.clone()
                .add(new THREE.Vector3(pan_intensity, 0, 0)),
                pan_duration, pan_ease
            )
            break;
    }

          tween.addEventListener("change", function(){
            console.log(buffer);
    
            Handler.cam.position.copy(buffer);
            Handler.controls.update();
        })
    
        tweenControl.addEventListener("change", function(){
            Handler.controls.target.copy(bufferControl);
            Handler.controls.update();
        })
}

$(this).on("keydown", function(e){
    if(![37, 38, 39, 40].includes(e.keyCode)) return;

    switch(e.keyCode){
        case 37: // Left Arrow
            pan_cam("LEFT");
            console.log("LEFT ARROW");
            break;
        case 38: // Up Arrow
        break;
            break;
        case 39: // Right Arrow
            pan_cam("RIGHT");
            console.log("RIGHT ARROW");
            break;
        case 40: // Down Arrow
            break;
    }
})