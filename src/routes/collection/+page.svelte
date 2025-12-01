<script lang="ts">
    import ArrowRight from "$lib/components/icons/arrow-right.svelte";
    import { Spinner } from "$lib/components/ui/spinner/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import QrScanner from "qr-scanner";
    import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";

    let { data, form }: PageProps = $props();
    let videoElem: HTMLVideoElement;
    let item = $state(data.ids[1].values[0][0]);
    let QRdata = $state("");
    let QRres = $state([]);
    let cameras = $state<QrScanner.Camera[]>([]);
    let camToUse = $state("");
    let camName = $state("Default");
    let scanner: QrScanner | null = null;
    let scanned = $state(false);
    let marking = $state(false);
    let collected = $state(false);

    $effect(() => {
        if (videoElem) {
            scanner = new QrScanner(
                videoElem,
                (result) => {
                    if (!scanned) {
                        let entry = "";
                        QRres = [];
                        QRdata = result.data;
                        entry = data.ids[0].values
                            .slice(1)
                            .find((entry) => entry[0] === QRdata);
                        if (entry) {
                            QRres = data.ids[0].values.find((entry) => {
                                return entry && entry[0] === QRdata;
                            });
                        }
                        const index = data.ids[0].values.findIndex(
                            (entry) => entry[0] === QRdata,
                        );
                        if (data.ids[1].values[index][0] == "TRUE") {
                            collected = true;
                        }
                        scanned = true;
                    }
                },
                {
                    highlightScanRegion: true,
                    preferredCamera: "environment",
                    calculateScanRegion: (video) => {
                        const size = 400;
                        return {
                            x: Math.round((video.videoWidth - size) / 2),
                            y: Math.round((video.videoHeight - size) / 2),
                            width: size,
                            height: size,
                            downScaledWidth: size,
                            downScaledHeight: size,
                        };
                    },
                },
            );

            scanner
                .start()
                .then(async () => {
                    cameras = await QrScanner.listCameras();
                    // commented out as usually [0] is front facing cam
                    // camToUse = cameras[0].id;
                })
                .catch((e) => console.error(e));

            return () => {
                scanner?.stop();
                scanner?.destroy();
            };
        }
    });

    async function changeCam(id: string) {
        await scanner?.setCamera(id);
        const cam = cameras.find((c) => c.id === id);
        camName = cam?.label || cam?.id || "Unknown camera";
    }

    $effect(() => {
        if (camToUse) {
            changeCam(camToUse);
        }
    });
</script>

<div class="h-full flex flex-col">
    <div class="grid grid-cols-2 bg-blue-50 text-black shrink-0">
        <Select.Root type="single" bind:value={item}>
            <Select.Trigger class="selector">{item}</Select.Trigger>
            <Select.Content>
                {#each data.ids[1].values[0] as freebie}
                    <Select.Item value={freebie}>{freebie}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
        <Select.Root type="single" bind:value={camToUse}>
            <Select.Trigger class="selector">{camName}</Select.Trigger>
            <Select.Content>
                {#each cameras as camera}
                    <Select.Item value={camera.id}>{camera.label}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
    </div>

    <div class="flex-1">
        <video
            bind:this={videoElem}
            playsinline
            muted
            class="w-full h-full object-cover"
        >
            <track kind="captions" />
        </video>
    </div>

    {#if scanned}
        {#if collected}
            <div class="absolute bottom-5 w-full px-5">
                <div class="bg-red-100 p-3 rounded-md">
                    <h2 class="text-xl font-semibold text-red-900">
                        Participant has collected item
                    </h2>
                    <p>Please do not pass the item</p>
                    <button
                        onclick={() => (
                            (QRdata = ""),
                            (scanned = false),
                            (collected = false)
                        )}
                        class="bg-red-950 text-red-50 p-2 flex justify-center items-center gap-3 mt-2 rounded-md font-medium"
                    >
                        Start Scanning
                        <ArrowRight size="20" />
                    </button>
                </div>
            </div>
        {:else if QRres && QRres.length > 0}
            <div class="absolute bottom-5 w-full px-5">
                <div
                    class=" bg-blue-100 p-3 rounded-md {form?.errorMsg
                        ? 'bg-red-100'
                        : 'bg-blue-100'}"
                >
                    <h2
                        class="text-xl font-semibold {form?.errorMsg
                            ? 'text-red-900'
                            : 'text-blue-900'}"
                    >
                        {form?.errorMsg
                            ? "Error, please screenshot"
                            : "Confirm Details"}
                    </h2>
                    <form
                        method="POST"
                        action="?/markPresent"
                        use:enhance={() => {
                            marking = true;
                            return async ({ update }) => {
                                await update({ reset: false });
                                marking = false;
                                if (!form?.errorMsg) {
                                    scanned = false;
                                }
                            };
                        }}
                    >
                        <p>
                            Name: {QRres[1]}
                            <br />
                            {#if form?.errorMsg}
                                Error: {form?.errorMsg}
                            {/if}
                        </p>
                        <input
                            name="id"
                            type="text"
                            class="hidden"
                            bind:value={QRdata}
                        />
                        <input
                            name="item"
                            type="text"
                            class="hidden"
                            bind:value={item}
                        />
                        {#if marking}
                            <button
                                class="bg-blue-950 text-blue-50 p-2 flex justify-center items-center gap-3 mt-2 rounded-md font-medium"
                            >
                                Marking...
                                <Spinner />
                            </button>
                        {:else if form?.errorMsg}
                            <button
                                onclick={() => (
                                    (QRdata = ""),
                                    (scanned = false),
                                    (form.errorMsg = "")
                                )}
                                class="bg-red-950 text-red-50 p-2 flex justify-center items-center gap-3 mt-2 rounded-md font-medium"
                            >
                                I have screenshotted
                                <ArrowRight size="20" />
                            </button>
                        {:else}
                            <button
                                class="bg-blue-950 text-blue-50 p-2 flex justify-center items-center gap-3 mt-2 rounded-md font-medium"
                            >
                                Mark Collected for {item}
                                <ArrowRight size="20" />
                            </button>
                        {/if}
                    </form>
                </div>
            </div>
        {:else}
            <div class="absolute bottom-5 w-full px-5">
                <div class="bg-red-100 p-3 rounded-md">
                    <h2 class="text-xl font-semibold text-red-900">
                        Invalid QR Code
                    </h2>
                    <p>Scanning has been paused</p>
                    <button
                        onclick={() => ((QRdata = ""), (scanned = false))}
                        class="bg-red-950 text-red-50 p-2 flex justify-center items-center gap-3 mt-2 rounded-md font-medium"
                    >
                        Start Scanning
                        <ArrowRight size="20" />
                    </button>
                </div>
            </div>
        {/if}
    {/if}
</div>
