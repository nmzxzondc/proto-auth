import { spawn, SpawnOptions } from 'node:child_process';
import path from 'node:path';
import fs from 'fs';

const files_dir = "./files/"
const lua_interpreter_dir = "./lua/lua55.exe"
const prometheus_dir = "./prometheus/"
const cli_dir = prometheus_dir + "cli.lua"

const options: SpawnOptions = {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: false,
    windowsHide: false,
}

function useRegex(input: string) {
    let regex = /\..*\./;
    return regex.test(input);
}

export class ObfuscateLuau {

    obfuscate(file_name: string) {
        if (!file_name) {
            console.log("file name is missing");
        }

        let luau_file = files_dir + file_name

        let luau_file_path = path.resolve(luau_file);
        let cli_path = path.resolve(cli_dir)
        let lua_interpreter_path = path.resolve(lua_interpreter_dir)

        const args = [
            cli_path,
            '--preset',
            'Medium',
            luau_file_path
        ]

        let child = spawn(lua_interpreter_path, args, options)

        child.stdout?.on('data', (data) => console.log(data.toString()));
    }

    obfuscateAll() {
        let files_path = path.resolve(files_dir);
        fs.readdir(files_path, (err, files) => {
            if (err) return console.log(err);

            files.forEach((file) => {
                let obfuscated_file = useRegex(file)

                if (obfuscated_file) {
                    return
                }

                console.log(useRegex(file), file)
                let script = new ObfuscateLuau();
                script.obfuscate(file)
            })
        })
    }
}