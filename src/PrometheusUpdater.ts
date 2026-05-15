const latest_release_api = "https://api.github.com/repos/prometheus-lua/Prometheus/releases/latest";
const prometheus_repo_path = "https://github.com/prometheus-lua/Prometheus.git";
const prome_version_file = "./prome-ver.txt"
const prometheus_folder = "./Prometheus/"
import { simpleGit,SimpleGitOptions } from 'simple-git';
import fetch from "node-fetch";
import path from 'node:path';
import fs from 'fs';

const options: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
};

const git = simpleGit(options);


async function update_folder() {
    try {
        console.log("Prometheus updating");
        fs.rmSync(path.resolve(prometheus_folder), { recursive: true, force: true });
        await git.clone(prometheus_repo_path, prometheus_folder)

        console.log("Prometheus updated");
    } catch (error) {
        console.log(error);
    }

}

export class PrometheusUpdater {

    async update() {
        try {
            const res = await fetch(latest_release_api, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                },
            }).then(res => res.json())


            let release = res.tag_name;

            const prome_exists = fs.existsSync(prometheus_folder);

            if (!prome_exists) {
                console.log("Downloading Prometheus");
                await git.clone(prometheus_repo_path, prometheus_folder)

                console.log("Downloaded Prometheus");
                return;
            }

            fs.readFile(path.resolve(prome_version_file), 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return
                }

                if (data == release) {
                    console.log("Prometheus up to date!");
                    return
                }

                update_folder()

                fs.writeFile(path.resolve(prome_version_file), release, (err) => {
                    if (err) {
                        console.error(err);
                    }
                })

            })
        } catch (error) {
            console.error(error);
        }
    }
}