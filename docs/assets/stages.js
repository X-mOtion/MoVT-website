// Method descriptions retained from the supplied project.
export const stages = [
  {
    kicker: 'STAGE 01 / THE FOUNDATION', title: 'Learn a 3D motion vocabulary.',
    description: 'A residual VQ-VAE learns discrete motion tokens from 3D sequences. The base codebook represents primary motion structure; residual layers recover additional detail.',
    facts: [['Input', '3D motion'], ['Learn', '3D encoder, decoder & codebooks']],
    formulaLabel: 'MOTION → DISCRETE TOKENS', formula: 'M<sup>3D</sup> → E<sup>3D</sup> → C<sup>3D</sup>', note: 'Base structure + residual detail',
  },
  {
    kicker: 'STAGE 02 / CROSS-DOMAIN ALIGNMENT', title: 'Connect the two motion spaces.',
    description: 'Paired 3D motion and projected 2D poses train forward and reverse codebook mappings. Reconstruction, cycle consistency and alignment losses establish corresponding base-token indices.',
    facts: [['Input', 'Paired 3D motion & projected 2D poses'], ['Learn', '2D tokenizer and mappings F / R']],
    formulaLabel: 'BIDIRECTIONAL CODEBOOK MAPPING', formula: 'C<sup>2D</sup> = F(C<sup>3D</sup>)', note: 'Reverse mapping R closes the cycle',
  },
  {
    kicker: 'STAGE 03 / VIDEO AUGMENTATION', title: 'Expand what the vocabulary can say.',
    description: 'Human action videos supply additional 2D motion patterns. The original aligned 2D codebook is kept fixed while additional entries and the 2D decoder learn to represent video-derived motion.',
    facts: [['Input', 'Human action videos from MotionX++'], ['Preserve', 'Original aligned 2D codebook']],
    formulaLabel: 'PRESERVE + EXPAND', formula: 'C<sup>2D*</sup> = [C<sup>2D</sup>, C<sup>2D</sup><sub>†</sub>]', note: 'New entries represent additional motion patterns',
  },
  {
    kicker: 'STAGE 04 / LIFT TO 3D', title: 'Bring the new motion codes into 3D.',
    description: 'The reverse mapping lifts newly learned 2D codes into the 3D codebook. The 3D tokenizer then adapts while the aligned base layer is preserved, with residual tokens refining the reconstruction.',
    facts: [['Transfer', 'Video-derived base tokens through R'], ['Adapt', '3D encoder, decoder & residual entries']],
    formulaLabel: 'VIDEO KNOWLEDGE → 3D VOCABULARY', formula: 'C<sup>3D</sup><sub>†</sub> = R(C<sup>2D</sup><sub>†</sub>)', note: 'Preserve alignment at the base-token layer',
  },
  {
    kicker: 'STAGE 05 / TEXT-CONDITIONED GENERATION', title: 'Let language move across domains.',
    description: 'A modality-agnostic masked transformer learns from text–token pairs in both domains. Predicted base indices are decoded in 2D or 3D; a residual transformer adds higher-layer detail for the final 3D motion.',
    facts: [['Input', 'Text–motion & text–video pairs'], ['Generate', 'Shared indices, domain-specific outputs']],
    formulaLabel: 'ONE TOKEN SEQUENCE, TWO DECODERS', formula: 'Text → G → S → D<sup>2D / 3D</sup>', note: 'Residual tokens refine the 3D output',
  },
];
