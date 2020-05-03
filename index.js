const remark = require("remark");
const { getOptions } = require("loader-utils");
const sanitizeHTML = require("sanitize-html");

function buildPlugins(plugins = []) {
  const normalize = (entry) => {
    return typeof entry === "string" ? require(entry) : entry;
  };

  return plugins.map((entry) => {
    return Array.isArray(entry)
      ? [normalize(entry[0]), entry[1] || {}]
      : [normalize(entry), {}];
  });
}

module.exports = function (source, map, meta) {
  const callback = this.async();

  const options = getOptions(this);
  const plugins = buildPlugins(options.plugins);
  const processor = remark().use(plugins);

  const tree = processor.parse(meta.body);
  processor.run(tree).then((ast) => {
    const html = processor.stringify(ast);
    const text = sanitizeHTML(html, {
      allowedAttributes: {},
      allowedTags: [],
    });

    const newMeta = Object.assign({}, meta, {
      ast,
      text,
      html,
    });

    callback(null, source, map, newMeta);
  });
};
