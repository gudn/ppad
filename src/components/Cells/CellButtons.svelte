<div class="outer">
  <div class="inner">
    <slot />
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
    background-color: $primary-color;
    border-radius: 4px;

    position: relative;
    top: -1.6em;
    padding: 5px;

    height: 1em;

    display: none;
    justify-content: center;
    align-items: center;
  }
</style>
