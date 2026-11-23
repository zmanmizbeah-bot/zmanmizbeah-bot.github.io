<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/fonts">
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8"/>
        <title>Hebrew Font Comparison – Shema Test</title>
        <link rel="stylesheet" type="text/css" href="style.css"/>
      </head>
      <body>
        <h1>Hebrew Font Comparison – Shema Paragraph</h1>

        <!-- one style block for all fonts -->
        <style>
          <xsl:for-each select="font">
            <xsl:text>@font-face { font-family: '</xsl:text>
            <xsl:value-of select="@name"/>
            <xsl:text>'; src: url('</xsl:text>
            <xsl:value-of select="@file"/>
            <xsl:text>') format('woff2'); }</xsl:text>
            <xsl:text>.font-</xsl:text><xsl:value-of select="position()"/>
            <xsl:text> { font-family: '</xsl:text>
            <xsl:value-of select="@name"/>
            <xsl:text>'; }</xsl:text>
          </xsl:for-each>
        </style>

        <xsl:for-each select="font">
          <div class="font-sample">
            <div class="font-label">
              <xsl:value-of select="@name"/>
            </div>
            <div>
              <xsl:attribute name="class">
                <xsl:text>shema font-</xsl:text>
                <xsl:value-of select="position()"/>
              </xsl:attribute>
ד שְׁמַ֖ע יִשְׂרָאֵ֑ל יְהוָ֥ה אֱלֹהֵ֖ינוּ יְהוָ֥ה ׀ אֶחָֽד׃ ה וְאָ֣הַבְתָּ֔ אֵ֖ת יְהוָ֣ה אֱלֹהֶ֑יךָ בְּכָל־לְבָֽבְךָ֥ וּבְכָל־נַפְשְׁךָ֖ וּבְכָל־מְאֹדֶֽךָ׃ ו וְהָי֞וּ הַדְּבָרִ֣ים הָאֵ֗לֶּה אֲשֶׁ֨ר אָֽנֹכִ֧י מְצַוְּךָ֛ הַיּ֖וֹם עַל־לְבָבֶֽךָ׃ ז וְשִׁנַּנְתָּ֣ם לְבָנֶ֔יךָ וְדִבַּרְתָּ֖ בָּ֑ם בְּשִׁבְתְּךָ֤ בְּבֵיתֶ֨ךָ֙ וּבְלֶכְתְּךָ֣ בַדֶּ֔רֶךְ וּֽבְשָׁכְבְּךָ֖ וּבְקוּמֶֽךָ׃ ח וּקְשַׁרְתָּ֥ם לְא֖וֹת עַל־יָדֶ֑ךָ וְהָי֥וּ לְטֹֽטָפֹ֖ת בֵּ֥ין עֵינֶֽיךָ׃ ט וּכְתַבְתָּ֛ם עַל־מְזֻז֥וֹת בֵּיתֶ֖ךָ וּבִשְׁעָרֶֽיךָ׃
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
