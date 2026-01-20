import chalk from 'chalk';
import ora from 'ora';

export enum ExitCode {
    Success = 0,
    GeneralError = 1,
    InvalidArguments = 2,
    ValidationError = 3,
    NetworkError = 4,
    FileSystemError = 5,
    ConfigError = 6,
}

export class Logger {
    private spinner = ora({
        color: 'cyan',
        spinner: 'dots',
        discardStdin: false,
    });

    info(message: string): void {
        this.spinner.stop();
        console.log(chalk.blue('ℹ'), message);
    }

    success(message: string): void {
        this.spinner.succeed(chalk.green(message));
    }

    warn(message: string): void {
        this.spinner.warn(chalk.yellow(message));
    }

    error(message: string | Error, code: ExitCode = ExitCode.GeneralError): never {
        this.spinner.fail();
        const msg = message instanceof Error ? message.message : message;
        console.error(chalk.red('✖'), msg);
        process.exit(code);
    }

    step(message: string): void {
        this.spinner.stop();
        console.log(chalk.cyan('→'), message);
    }

    start(message: string): void {
        this.spinner.start(message);
    }

    stop(success = true): void {
        if (success) {
            this.spinner.succeed();
        } else {
            this.spinner.fail();
        }
    }

    newline(count = 1): void {
        console.log('\n'.repeat(count));
    }

    header(title: string): void {
        this.newline();
        console.log(chalk.bold.underline(title));
        this.newline();
    }

    keyValue(key: string, value: string | number): void {
        console.log(chalk.gray('  •'), chalk.white(key.padEnd(14)), chalk.cyan(value));
    }

    box(title: string, content: string): void {
        const lines = content.split('\n');
        const maxLen = Math.max(...lines.map(l => l.length), title.length) + 4;
        const border = '─'.repeat(maxLen + 2);

        console.log(chalk.gray('┌' + border + '┐'));
        console.log(chalk.gray('│') + chalk.bold(` ${title} `.padEnd(maxLen + 2)) + chalk.gray('│'));
        console.log(chalk.gray('├' + border + '┤'));

        lines.forEach(line => {
            console.log(chalk.gray('│ ') + line.padEnd(maxLen) + chalk.gray(' │'));
        });

        console.log(chalk.gray('└' + border + '┘'));
    }
}

export const logger = new Logger();