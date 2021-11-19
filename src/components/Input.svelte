<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import debounce from 'lodash.debounce'

  let value: string = ''
  let prev: string = ''
  const dispatch = debounce(createEventDispatcher(), 200)

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
  <input type="text" bind:value on:keyup={trySubmit} on:keyup={update} />
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
      margin-left: -24px;
      padding: 1px 24px;
      z-index: 1;

      &:active {
        outline-color: $text-color;
      }
    }

    .slot-wrapper {
      display: inline-flex;
      width: 24px;
      padding: 4px;
      box-sizing: border-box;
    }
  }
</style>
