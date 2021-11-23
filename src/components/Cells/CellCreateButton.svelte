<script lang="ts">
  export let index: number
</script>

<div class="outer click-handler create-cell" data-index={index}>
  <hr />
  <span class="inner">
    <button>
      <span class="icon" />
      <span class="label">Create</span>
    </button>
  </span>
</div>

<style lang="scss">
  @import '../../styles/variables.scss';

  .outer {
    min-height: 20px;
    position: relative;

    .inner {
      display: none;
      align-items: center;
      flex-direction: row;
      justify-content: center;

      position: absolute;
      top: -50%;
      width: 100%;
      height: 40px;
    }

    button {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      height: 24px;

      background-color: $primary-color;
      color: $text-color;
      border-radius: 6px;
      border: none;
      padding: 2px 5px;

      .icon {
        background-image: url('/icons/add.svg');
        background-size: 14px 14px;
        min-width: 14px;
        min-height: 14px;
        filter: invert(93.3%);
        margin-right: 0.3em;
      }

      .label {
        margin-top: 2px;
      }

      &:hover, &:focus {
        background-color: $hover-color;
      }
    }

    hr {
      display: none;
      position: absolute;
      top: 1px;
      width: 100%;
    }

    &:hover {
      .inner {
        display: flex !important;
      }

      hr {
        display: block;
      }
    }
  }
</style>
