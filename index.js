#!/usr/bin/env node
const fs = require("fs")
const inquirer = require("inquirer")

const PREF_FILE = process.env.HOME + "/.codex-deploy.json"

main()

function main() {
    fs.stat(PREF_FILE, (err, stats) => {
        if (err) {
            console.log(`Le fichier ${PREF_FILE} n'existe pas`)

            askPreferences()
        } else {
            console.log(`Fichier des préférences ${PREF_FILE} trouvé`)

            const data = require(PREF_FILE)

            console.log("\nTransfert vers /venezia/htdocs/" + data.project)

            if (data.authType === "Nom/mot de passe"){
                console.log("Utilisateur/mot de passe : " + data.username + " / " + data.password)
            } else {
                console.log("Chemin vers clé privéee", data.privateKeyFile)
            }
        }
    })

}

function askPreferences() {
    console.log("\n")

    inquirer.prompt([{
        name: "project",
        message: "Nom du projet Venezia (exemple: Smartphone) ",
        validate: input => {
            //console.log("answers", JSON.stringify(answers))
            return input ? true : "Le nom du projet ne peut pas être vide"
        }
    }, {
        name: "authType",
        message: "Par quel moyen voulez-vous vous identifier?",
        type: "list",
        choices: ["Nom/mot de passe", "Fichier de clé privé"]
    },
    {
        name: "username",
        message: "Utilisateur Venezia : ",
        when: function (answers) {
            return answers.authType === "Nom/mot de passe"
        }, 
        validate: input => {
            return input ? true : "L'utilisateur Venezia ne peut pas être vide"
        }
    }, {
        name: "password",
        message: "Mot de passe Venezia : ",
        type: "password",
        mask: "*",
        when: function (answers) {
            return answers.authType === "Nom/mot de passe"
        }, 
        validate: input => {
            return input ? true : "Le mot de passe ne peut pas être vide"
        }
    }, {
        name: "privateKeyFile",
        message: "Chemin vers votre clé privée",
        when: function (answers) {
            return answers.authType !== "Nom/mot de passe"
        }, 
        validate: input => {
            return input ? true : "Le chemin vers votre clé privée ne peut pas être vide"
        }
    }, {
        name: "privateKeyPassphrase",
        message: "Passphrase pour votre clé privée (optionnel)",
        when: function (answers) {
            return answers.authType !== "Nom/mot de passe"
        }
    }]).then(answers => {

        try {
            fs.writeFileSync(PREF_FILE, JSON.stringify(answers, null, "\t"))
        } catch (err) {

            console.error(`\nErreur pour écrire le fichier ${PREF_FILE}. \nVeuillez vérifier les permissions sur le fichier.`)
            //console.error(JSON.stringify(err, null, "\t"))
        }

        main()
    })
}