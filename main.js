const list = new HumanArray();

let test;

document.addEventListener("DOMContentLoaded", () => {
    const c = document.getElementById("c");

    // Position.LOCKY = true;

    Handler._init({
        c: c,
        animator: new AnimationQueue({})
    })

    // LOAD TEXTURES FIRST
    F1.forEach(item => {
        const name = parseName(item.name).split(" ").join("");
        // Sphere version
        Handler.addTexture(name);
        // Cube Version
        Handler.addTexture(name + "_C");
    })

    // By default, group members are already generated
    const groupMates = F1.map((e, i) => `${i}|${e.groupMate ? 1 : 0}`).filter(e => e.split("|")[1] == "1").map(index => F1_enator(parseInt(index)));

    list.add(...groupMates);
    // refresh following list
    list._updateFollower();

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