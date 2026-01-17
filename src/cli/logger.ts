
import chalk from 'chalk';

export enum ExitCode {
    Success = 0,
    GeneralError = 1,
    InvalidArguments = 2,
    ValidationError = 3,
    NetworkError = 4,
    FileSystemError = 5,
}

export class Logger {
    private spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private spinnerInterval: NodeJS.Timeout | null = null;
    private currentSpinnerMessage: string | null = null;

    info(message: string): void {
        this.stopSpinner();
        console.log(chalk.blue('ℹ'), message);
    }

    success(message: string): void {
        this.stopSpinner();
        console.log(chalk.green('✓'), message);
    }

    warning(message: string): void {
        this.stopSpinner();
        console.log(chalk.yellow('⚠'), message);
    }

    error(message: string, code: ExitCode = ExitCode.GeneralError): never {
        this.stopSpinner();
        console.error(chalk.red('✖'), message);
        process.exit(code);
    }

    step(message: string): void {
        this.stopSpinner();
        console.log(chalk.cyan('→'), message);
    }

    startSpinner(message: string): void {
        this.stopSpinner();
        this.currentSpinnerMessage = message;
        let i = 0;

        this.spinnerInterval = setInterval(() => {
            process.stdout.write(`\r${this.spinnerFrames[i]} ${message}`);
            i = (i + 1) % this.spinnerFrames.length;
        }, 80);
    }

    stopSpinner(success = true): void {
        if (this.spinnerInterval) {
            clearInterval(this.spinnerInterval);
            this.spinnerInterval = null;

            if (this.currentSpinnerMessage) {
                process.stdout.write('\r');
                if (success) {
                    this.success(this.currentSpinnerMessage);
                }
                this.currentSpinnerMessage = null;
            }
        }
    }

    newLine(): void {
        console.log();
    }

    stats(label: string, value: string | number): void {
        console.log(chalk.gray('  •'), `${chalk.white(label)}: ${chalk.cyan(value)}`);
    }
}

export const logger = new Logger();