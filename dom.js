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
})

$("#sortbtn").on("click", function(){
    $("#shufflebtn, #genElementCont").hide();
    $("#stopbtn, #contbtn").show();
    $(this).hide();
    QuickSort.sort(list);
    Handler.addAnimation(new Animation(() => {
        $("#shufflebtn, #genElementCont").show();
        $("#stopbtn, #contbtn").hide();
        $(this).show();
    }, 10, 0, 0));
})

$("#stopbtn, #contbtn").hide();
$("#stopbtn").on("click", function(){
    const revealing = Handler.a.queue.pop();
    Handler.a.queue.length = 0;
    Handler.addAnimation(revealing);
    Handler.a.ongoing.forEach(anim => anim.setPosition(anim.duration));
    const savedTimeMult = Handler.a.config.timeMult;
    Handler.a.config.timeMult = 0.1;
    list.backToState();
    Handler.a.config.timeMult = savedTimeMult;
})

$("#shufflebtn").on("click", () => {list.shuffle()})

$("#generate").on("click", function(){
    const f1Mode = $("#f1mode").prop("checked"),
          amount = $("#genAmount").data("ionRangeSlider").result.from;

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
    }else{
        $("#inputs").val(Array(amount).fill(0).map(x => {
            return Util.genInt(1, 99);
        }).join(" "))

        
        $("#visualize").click()
    }

})