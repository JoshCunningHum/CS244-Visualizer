const list = new HumanArray();

let test;

document.addEventListener("DOMContentLoaded", () => {
    const c = document.getElementById("c");

    // Position.LOCKY = true;

    Handler._init({
        c: c,
        animator: new AnimationQueue({})
    })

    // F1.forEach(s => {
    //     const disp = `${s.name[0]}. ${s.name.split(" ").pop()}`,
    //           h = parseInt(s.height);


    //     F1Obs.push(new Human({
    //         name: disp,
    //         value: h,
    //         height: Util.heightCalc(h)
    //     }))
    // })

    // list.add(...F1Obs);
    // test = list.get(0);

    // /*DEV PURPOSES*/
    // Handler.a.config.overrideContinue = true;   
    // Handler.a.config.timeMult = 0.2;
})