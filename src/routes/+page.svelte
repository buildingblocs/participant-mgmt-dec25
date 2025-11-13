<script lang="ts">
    import Person from "$lib/components/icons/person.svelte";
    import Upload from "$lib/components/icons/upload.svelte";
    import ExclamationTriangle from "$lib/components/icons/exclamation-triangle.svelte";
    import type { LayoutProps } from "./$types";
    import Button from "$lib/components/button.svelte";

    let { data }: LayoutProps = $props();
</script>

{#if data.session.isOrgMember}
    <div class="flex flex-col gap-5 m-5">
        <a href="/attendance">
            <Button text="Attendance">
                <Person />
            </Button>
        </a>

        <a href="/collection">
            <Button text="Freebie Collection">
                <Upload />
            </Button>
        </a>
    </div>
{:else}
    <div class="flex flex-col mt-10 m-5">
        <div class="rounded-full w-min">
            <ExclamationTriangle size="50" colour="#172554" />
        </div>
        <h2
            class="text-2xl text-blue-950 font-semibold tracking-tight mb-2 mt-1"
        >
            401: Unauthorised
        </h2>
        <p>
            Either your credentials are expired, or you are not in the
            BuildingBloCS GitHub Organisation. You should try to log out and log
            back in.
        </p>
    </div>
{/if}
