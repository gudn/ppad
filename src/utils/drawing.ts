import type { TDShape, TldrawApp } from '@tldraw/tldraw'
import { getShapeUtil, shapeUtils } from '@tldraw/tldraw'
import { Utils } from '@tldraw/core'

export function exportSvgs(app: TldrawApp): { [page: string]: string } {
  const svgs = {}
  const selected = app.currentPageId
  for (const [page, content] of Object.entries(app.document.pages)) {
    app.changePage(page)
    const svg = app.copySvg(Object.keys(content.shapes), page)
    if (svg) {
      svgs[page] = svg
    }
  }
  app.changePage(selected)
  return svgs
}

function exportPage(app: TldrawApp, pageId: string): string | undefined {
  const page = app.document.pages[pageId]
  const ids = Object.keys(page.shapes)
  if (ids.length === 0) return

  const shapes = ids.map(id => this.getShape(id, pageId))
  const commonBounds = Utils.getCommonBounds(
    shapes.map(shape => getShapeUtil(shape).getRotatedBounds(shape)),
  )
  const padding = 16

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')

  style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Source+Code+Pro&family=Source+Sans+Pro&family=Source+Serif+Pro&display=swap');`
  defs.appendChild(style)
  svg.appendChild(defs)

  function getSvgElementForShape(shape: TDShape) {
    const util = getShapeUtil(shape)
    const element = util.getSvgElement(shape)
    const bounds = util.getBounds(shape)

    if (!element) return

    element.setAttribute(
      'transform',
      `translate(${padding + shape.point[0] - commonBounds.minX}, ${
        padding + shape.point[1] - commonBounds.minY
      }) rotate(${((shape.rotation || 0) * 180) / Math.PI}, ${
        bounds.width / 2
      }, ${bounds.height / 2})`,
    )

    return element
  }

  shapes.forEach(shape => {
    if (shape.children?.length) {
      // Create a group <g> element for shape
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      // Get the shape's children as elements
      shape.children
        .map((childId: any) => this.getShape(childId, pageId))
        .map(getSvgElementForShape)
        .filter(Boolean)
        .forEach((element: any) => g.appendChild(element!))

      // Add the group element to the SVG
      svg.appendChild(g)

      return
    }

    const element = getSvgElementForShape(shape)

    if (element) {
      svg.appendChild(element)
    }
  })

  // Resize the element to the bounding box
  svg.setAttribute(
    'viewBox',
    [
      0,
      0,
      commonBounds.width + padding * 2,
      commonBounds.height + padding * 2,
    ].join(' '),
  )

  svg.setAttribute('width', String(commonBounds.width))
  svg.setAttribute('height', String(commonBounds.height))

  const s = new XMLSerializer()

  const svgString = s
    .serializeToString(svg)
    .replace(/&#10;      /g, '')
    .replace(/((\s|")[0-9]*\.[0-9]{2})([0-9]*)(\b|"|\))/g, '$1')

  return svgString
}
