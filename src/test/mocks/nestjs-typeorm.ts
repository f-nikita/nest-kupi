import { Inject } from '@nestjs/common';

type EntityClass = { name: string };

export const getRepositoryToken = (entity: EntityClass) =>
  `${entity.name}Repository`;

export const InjectRepository = (entity: EntityClass): ParameterDecorator =>
  Inject(getRepositoryToken(entity));
