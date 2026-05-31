export function buildColumnDefs(columns = []) {
  const root = [];

  columns.forEach((column) => {
    const headerPath = Array.isArray(column.headerPath)
      ? column.headerPath
      : [];

    // 1단
    if (headerPath.length === 0) {
      root.push({
        field: column.field,
        headerName: column.headerName,
      });

      return;
    }

    let currentLevel = root;

    headerPath.forEach((header, index) => {
      const isLeaf = index === headerPath.length - 1;

      let node = currentLevel.find((item) => item.headerName === header);

      if (!node) {
        node = {
          headerName: header,
        };

        if (!isLeaf) {
          node.children = [];
        }

        currentLevel.push(node);
      }

      if (isLeaf) {
        node.field = column.field;
      } else {
        currentLevel = node.children;
      }
    });
  });

  return root;
}
