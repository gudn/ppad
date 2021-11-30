<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  import debounce from 'lodash.debounce'

  export let autofocus: boolean = false

  export let value: string = ''
  let prev: string = ''
  let input: HTMLInputElement
  const dispatch = debounce(createEventDispatcher(), 200)

  onMount(() => {
    if (autofocus) input.focus()
  })

  function trySubmit(e: KeyboardEvent) {
    const trimmed = value.trim()
    if (!trimmed || e.key !== 'Enter') return
    dispatch('submit', { alt: e.altKey || e.ctrlKey, value: trimmed })
  }

  function update() {
    const trimmed = value.trim()
    if (trimmed === prev) return
    prev = trimmed
    dispatch('update', { value: trimmed })
  }
</script>

<div class="input-wrapper">
  <input
    type="text"
    bind:value
    on:keyup={trySubmit}
    on:keyup={update}
    bind:this={input}
  />
  <div class="slot-wrapper">
    <slot name="icon" />
  </div>
</div>

<style lang="scss">
  @import '../styles/variables.scss';

  .input-wrapper {
    display: flex;
    flex-direction: row-reverse;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background-color: $primary-color;
    border-radius: 4px;

    input {
      border-color: transparent;
      flex: 1;
      background-color: transparent;
      color: $text-color;
      margin-left: -29px;
      padding: 1px 29px;
      z-index: 1;

      &:active {
        outline-color: $text-color;
      }
    }

    .slot-wrapper {
      display: inline-flex;
      width: 29px;
      padding: 4px;
      box-sizing: border-box;
    }
  }
</style>
