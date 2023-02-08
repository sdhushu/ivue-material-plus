import type { ComponentResolver, ComponentInfo } from './types';

export interface resolverOptions {
  // use commonjs lib & source css or scss for ssr
  ssr?: boolean;
  // 是否引入style
  importStyle?: boolean | 'sass' | 'css';
  // 组件名称
  name?: string;
  // 排除组件名称，如果匹配不解析名称
  exclude?: RegExp;
  // 自动导入指令
  directives?: boolean;
  // 没有样式的组件名称列表，因此应该阻止解析它们的样式文件
  noStylesComponents?: string[];
}

export interface options extends resolverOptions {
  // 没有样式的组件名称列表，因此应该阻止解析它们的样式文件
  noStylesComponents: string[];
}

// 转换为驼峰
function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim();
  return result.split(' ').join('-').toLowerCase();
}

// 没有样式的组件
const noStylesComponents: string[] = [];

function getSideEffects(dirName: string, options: resolverOptions) {
  const { importStyle, ssr } = options;

  const themeFolder = 'ivue-material-plus/styles';

  // scss
  if (importStyle === 'sass') {
    return ssr
      ? `${themeFolder}/src/${dirName}.scss`
      : `@${themeFolder}/src/${dirName}.scss`;
  }
  // 有样式
  else if (importStyle === true || importStyle === 'css') {
    return ssr
      ? `${themeFolder}/${dirName}.css`
      : `@${themeFolder}/${dirName}/css`;
  }
}

// 请求组件
const resolveComponent = (
  componentsName: string,
  options: resolverOptions
): ComponentInfo | undefined => {
  // 排除组件
  if (options.exclude && componentsName.match(options.exclude)) {
    return;
  }

  // 不是自身属性
  if (!componentsName.match(/^Ivue[A-Z]/)) {
    return;
  }

  const partialName = kebabCase(componentsName); // IvueTableColumn -> table-column

  return {
    name: componentsName,
    from: `ivue-material-plus/${options.ssr ? 'lib' : 'es'}`,
    sideEffects: getSideEffects(partialName, options),
  };
};

export function IvueMaterialPlusResolver(
  options?: resolverOptions
): ComponentResolver[] {
  let optionsResolved: resolverOptions;

  // 加载选项配置
  async function resolveOptions() {
    if (optionsResolved) {
      return optionsResolved;
    }

    optionsResolved = {
      ssr: false,
      importStyle: 'css',
      directives: true,
      exclude: undefined,
      noStylesComponents: options?.noStylesComponents || [],
      ...options,
    };

    return optionsResolved;
  }

  return [
    {
      type: 'component',
      resolve: async (name: string) => {
        const options = (await resolveOptions()) as options;

        // 是否是 ivue组件
        if (!name.match(/^Ivue[A-Z]/)) {
          return;
        }

        // 没有样式
        if (
          [...options.noStylesComponents, ...noStylesComponents].includes(name)
        ) {
          return resolveComponent(name, { ...options, importStyle: false });
        }
        // 有样式
        else {
          return resolveComponent(name, options);
        }
      },
    },
  ];
}
