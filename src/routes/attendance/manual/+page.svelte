<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import type { PageProps } from "./$types";

    let { data, form }: PageProps = $props();
    let day = $state("1");
</script>

<div class="h-full flex flex-col">
    <div class="bg-blue-50 text-black shrink-0">
        <Select.Root type="single" bind:value={day}>
            <Select.Trigger class="selector">Day {day}</Select.Trigger>
            <Select.Content>
                <Select.Item value="1">Day 1</Select.Item>
                <Select.Item value="2">Day 2</Select.Item>
                <Select.Item value="3">Day 3</Select.Item>
            </Select.Content>
        </Select.Root>
    </div>

    <div class="p-3">
        <Input type="text" placeholder="Search with email or name" />
    </div>
</div>
