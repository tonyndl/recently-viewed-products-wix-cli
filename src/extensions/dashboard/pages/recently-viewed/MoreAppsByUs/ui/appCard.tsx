import type { FC } from 'react';
import { Box, Button, Text } from '@wix/design-system';
import { styles } from './styles/appCard';

interface AppCardProps {
  name: string;
  description: string;
  icon: string;
  url: string;
}

export const AppCard: FC<AppCardProps> = ({ name, description, icon, url }) => (
  <div style={styles.card}>
    <img src={icon} alt={name} style={styles.icon} />
    <Text weight="bold" size="small">
      {name}
    </Text>
    <div style={styles.descriptionWrapper}>
      <Text size="tiny" secondary>
        {description}
      </Text>
    </div>
    <Box align="center">
      <Button size="tiny" priority="secondary" as="a" href={url} target="_blank">
        Get App
      </Button>
    </Box>
  </div>
);
