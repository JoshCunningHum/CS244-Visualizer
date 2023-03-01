const F1 = [{
    name: "Jadge Garcia",
    height: "167"
}, {
    name: "Kyle Canonigo",
    height: "170"
}, {
    name: "John Dherick Velez",
    height: "170"
}, {
    name: "Chris Jerzey Paz",
    height: "173"
}, {
    name: "Kristéan Emmanuel Beniga",
    height: "165"
}, {
    name: "Franco Pleños",
    height: "160"
}, {
    name: "Jeño Flores",
    height: "165"
}, {
    name: "Christian Roy Seville",
    height: "177"
}, {
    name: "Winson Baring",
    height: "167"
}, {
    name: "Marion Buhat",
    height: "164"
}, {
    name: "Meachelle Abella",
    height: "161"
}, {
    name: "Jhudiel Muñoz",
    height: "170"
}, {
    name: "Karl Brandon Ocfemia",
    height: "167"
}, {
    name: "Raiza Mae Pagatpatan",
    height: "154"
}, {
    name: "Sheer Jay Piodos",
    height: "165"
}, {
    name: "Jethro Baring",
    height: "170"
}, {
    name: "Jasper Keith Villacera",
    height: "166"
}, {
    name: "Elroi Villarias",
    height: "167"
}, {
    name: "Christian Gabriel Adequiña",
    height: "167"
}, {
    name: "Rufelle Pactol",
    height: "167"
}, {
    name: "Ashley Lazaraga",
    height: "144"
}, {
    name: "Mikkaella Quiton",
    height: "150"
}, {
    name: "James Cabarrubias",
    height: "173"
}, {
    name: "Franz Genegobis",
    height: "165"
}, {
    name: "John Joseph Pableo",
    height: "171"
}, {
    name: "Jethan Kaelou Sarita",
    height: "167"
}, {
    name: "Noel Alemaña",
    height: "153"
}, {
    name: "Lucky Jones Uayan",
    height: "168"
}, {
    name: "Erwin Lambujon",
    height: "168"
}, {
    name: "Jun Cyric DelaTorre",
    height: "176"
}, {
    name: "Elm Jarrell Rodriguez",
    height: "170"
}, {
    name: "Renz Russell Wacan",
    height: "167"
}, {
    name: "Nicole Castro",
    height: "160"
}, {
    name: "Sherwin Nikolai Saga",
    height: "170"
}, {
    name: "Ruby Ann Lisondra",
    height: "157"
}, {
    name: "Jess Oliver Zoilo",
    height: "170"
}, {
    name: "Issabela Olasiman",
    height: "165"
},];

const F1_enator = (index) => {
    const s = F1[index], h = parseFloat(s.height);

    return new Human({
        name: `${s.name[0]}. ${s.name.split(" ").pop()}`,
        value: s.height,
        height: Util.heightCalc(h)
    });
} 

const F1Obs = [];