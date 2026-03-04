// socal management

import { SocialLink } from './socialLink.model';

const createSocialLinks = async (socialLinks: any) => {
  const links = {
    facebook:
      typeof socialLinks.facebook === 'string' ? socialLinks.facebook : '',
    instagram:
      typeof socialLinks.instagram === 'string' ? socialLinks.instagram : '',
    linkedin:
      typeof socialLinks.linkedin === 'string' ? socialLinks.linkedin : '',
    twitter: typeof socialLinks.twitter === 'string' ? socialLinks.twitter : '',
  };

  const names = Object.keys(links) as (keyof typeof links)[];

  const operations = names.map(async name => {
    const value = links[name];
    const existing = await SocialLink.findOne({ name });
    if (existing) {
      existing.socialLink = value;
      return existing.save();
    }
    return SocialLink.create({ name, socialLink: value });
  });

  await Promise.all(operations);

  return SocialLink.find({ name: { $in: names } }).sort({ createdAt: 1 });
};

const getSocialLinks = async () => {
  const socialLinks = await SocialLink.find().sort({ createdAt: -1 });
  return socialLinks;
};

export const SocialLinkService = {
  createSocialLinks,
  getSocialLinks,
};
