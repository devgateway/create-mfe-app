// eslint-disable-next-line import/no-extraneous-dependencies
import ejs from 'ejs';

export const rendertemplate = (template: string, data: any) => ejs.render(template, data);
