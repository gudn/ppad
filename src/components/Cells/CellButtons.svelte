<script lang="ts">
  import type { PCell } from '../../models/cells'

  export let index: number
</script>

<div class="outer">
  <div class="inner">
    <button class="click-handler draw-cell" data-index={index}>
      <span class="icon pencil" />
      <span class="label">Drawing</span>
    </button>
    <button class="click-handler up-cell" data-index={index}>
      <span class="icon arrow-up" />
      <span class="label">Up</span>
    </button>
    <button class="click-handler down-cell" data-index={index}>
      <span class="icon arrow-down" />
      <span class="label">Down</span>
    </button>
    <button class="click-handler delete-cell" data-index={index}>
      <span class="icon trash" />
      <span class="label">Delete</span>
    </button>
  </div>
</div>

<style lang="scss">
  @import '../../styles/variables.scss';

  .outer {
    position: absolute;
    top: 0;
    right: 1em;
    min-height: 1.5em;
    min-width: 10vw;

    &:hover .inner {
      display: flex !important;
    }
  }


  .inner {
    border-radius: 4px;

    position: relative;
    top: -1em;

    height: 1em;

    display: none;
    justify-content: center;
    align-items: center;

    button {
      background-color: $primary-color;
      color: $text-color;
      border: 1px solid $border-color;
      border-left: none;

      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;

      padding: 2px 5px;

      .icon {
        &.arrow-up {
          background-image: url('/icons/arrow-up.svg');
        }

        &.arrow-down {
          background-image: url('/icons/arrow-down.svg');
        }

        &.trash {
          background-image: url('/icons/trash.svg');
        }

        &.pencil {
          background-image: url('/icons/pencil.svg');
        }

        background-size: 17px 17px;
        min-width: 17px;
        min-height: 17px;
        filter: invert(93.3%);
        margin-right: 0.3em;
      }

      .label {
        margin-top: 2px;
      }

      &:hover, &:focus {
        background-color: $hover-color;
      }

      &:first-child {
        border-left: 1px solid $border-color;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      &:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }
  }
</style>
