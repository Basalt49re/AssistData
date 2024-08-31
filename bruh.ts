import { readdir, readFile,writeFile } from "node:fs/promises";
const unEscapeForFilename = (str: string) => str.replaceAll("_"," ").replaceAll("-","/").replaceAll("+",".").replaceAll(";",":")

//BASE FOLDER
const baseFolder = "./";
//YEAR
const year = 2024;


const communityColleges = new Map<string,any>();
const transferColleges = new Map<string,any>();


//For each folder in base/year
for (const folder of await readdir(baseFolder + "/" + year)) {
    if(folder === 'igetc') continue;
    const filesInFolder = await readdir(baseFolder + "/" + year + "/" + folder);
 
    const firstFile = JSON.parse(await readFile(baseFolder + "/" + year + "/" + folder + "/" + filesInFolder[0],{encoding: "utf8"}));
    //Read first file to get college info
    const communityCollege = firstFile.from
    communityColleges.set(communityCollege.id, {
        id: communityCollege.id,
        name: communityCollege.names[0].name,
        code: communityCollege.code.trim(),
        category: communityCollege.category,
    });

    const transferCollege = firstFile.to
    console.log(`Processing ${communityCollege.names[0].name} -> ${transferCollege.names[0].name}`);
   

    //Now add majors to majors array
    const majors = [];

    for(const file of filesInFolder) {
        const majorName = unEscapeForFilename(file.replace(".json",""));
        majors.push(majorName);
    }

    if(transferColleges.has(transferCollege.id)) {
       const existingMajors = transferColleges.get(transferCollege.id).majors;
       const uniqueConcat = Array.from(new Set([...existingMajors, ...majors]));
       transferColleges.set(transferCollege.id, {
            id: transferCollege.id,
            name: transferCollege.names[0].name,
            code: transferCollege.code.trim(),
            category: transferCollege.category,
            majors: uniqueConcat,
        });
    }else{
        transferColleges.set(transferCollege.id, {
            id: transferCollege.id,
            name: transferCollege.names[0].name,
            code: transferCollege.code.trim(),
            category: transferCollege.category,
            majors,
        });
    }


    

   
}

//Save to info.json
await writeFile("./data.json", JSON.stringify({
        communityColleges: Array.from(communityColleges.entries()),
        transferColleges: Array.from(transferColleges.entries()),
}, null, 2), {encoding: "utf8"});