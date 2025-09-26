import { select, confirm } from '@inquirer/prompts';
import { cleanIntakeDir, readMetadata, removeGeneratedFilesNotInMetadata, removeMetadataEntriesWithoutFile, writeMetadata, writeTypes } from './metadataHelper';
import doIntakeImport from './intakeImportHandler';
import doStaticImport from './staticImportHandler';

export async function imageIntakeCLI() {

    const modes = await promptCLIMode();

    const metadata = readMetadata();

    const intakeImportPromise = modes.has("intake") ? doIntakeImport(metadata) : Promise.resolve([]);
    const staticImportPromise = modes.has("static") ? doStaticImport(metadata) : Promise.resolve();

    await staticImportPromise;
    const intakeImportedFilenames = (await intakeImportPromise).filter(f => f && f !== "") as string[];

    if (modes.has("metadata")) {
        removeMetadataEntriesWithoutFile(metadata);
        removeGeneratedFilesNotInMetadata(metadata);
        writeMetadata(metadata);
    }

    if (modes.has("types")) {
        writeTypes(metadata);
    }

    if (intakeImportedFilenames.length && await promptShouldClearIntakeFolder()) {
        cleanIntakeDir(intakeImportedFilenames)
    }
}

async function promptCLIMode(): Promise<Set<ImageCLIMode>> {
    const modeString = await select({
        message: "select a mode",
        choices: [
            {
                name: "all",
                value: "static|intake|metadata|types",
                description: "process static images, intake images, and regenerate types",
            },
            {
                name: "static",
                value: "static|metadata|types",
                description: "process static images in /public and regenerate types",
            },
            {
                name: "intake",
                value: "intake|metadata|types",
                description: "process images in intake folder and regenerate types",
            },
            {
                name: "types",
                value: "types",
                description: "just regenerate types",
            },
        ],
    })

    return new Set(modeString.split("|")) as Set<ImageCLIMode>;
}

async function promptShouldClearIntakeFolder() {
    return await confirm({
        message: "clear intake folder?",
        default: true,
    });
}