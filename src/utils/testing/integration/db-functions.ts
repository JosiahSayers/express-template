import { exec } from 'child_process';

export const removeAllFromTable = async (table: 'user' | 'post'): Promise<void> => {
    return new Promise((resolve, reject) => {
        const disableTTY = '-T';
        const environmentVariables = 'PGPASSWORD=postgres';
        const containerName = 'db';
        const command = `psql -U postgres -d blog -c 'DELETE FROM ${table};' -h localhost`;
        exec(`docker-compose exec ${disableTTY} -e ${environmentVariables} ${containerName} ${command}`, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                reject();
            }

            if (stderr) {
                console.log(stderr);
                reject();
            } 

            resolve();
        });
    });
};
