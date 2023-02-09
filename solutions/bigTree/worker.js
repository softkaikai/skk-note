const tree = getTree(['vegetable', 'fruit', 'book'], 10000)
self.postMessage(flattenTree(tree))

self.addEventListener('message', ({data}) => {
  console.log('main message', data);
})


function flattenTree(tree, result = []) {
  tree.forEach(i => {
    result.push(i)
    if (i.children) {
      flattenTree(i.children, result)
    }
  })

  return result
}
function getTree(parents, childrenLength) {
  const result = []
  parents.forEach((parent, index) => {
    const data = {
      name: parent,
      id: index + '',
      level: 1,
      visiable: true,
      expand: true,
    }
    data.children = getChildren(data, childrenLength)
    result.push(data)
  })

  function getChildren(parent, length) {
    const result = []
    for(let i = 0; i < length; i++) {
      result.push({
        name: `${parent.name}_${i}`,
        id: `${parent.id}_${i}`,
        parentId: parent.id,
        level: 2,
        visiable: true,
        expand: true,
      })
    }

    return result
  }

  return result
}